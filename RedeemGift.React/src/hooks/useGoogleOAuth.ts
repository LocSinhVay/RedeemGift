import { useRef, useState } from "react";
import { toast } from "sonner";

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface GoogleUserInfo {
  email?: string;
}

export const useGoogleOAuth = () => {
  const [loading, setLoading] = useState(false);

  // Chặn validateGmailConfig bị gọi 2 lần cùng lúc
  const validatingRef = useRef(false);

  // Chặn mở OAuth popup 2 lần cùng lúc
  const signingInRef = useRef(false);

  const getErrorMessage = (fallback: string, data: any) => {
    if (data?.error && data?.error_description) {
      return `${data.error}: ${data.error_description}`;
    }

    return data?.error?.message || data?.error || data?.error_description || fallback;
  };

  const isInvalidGrant = (error: unknown) => {
    return error instanceof Error && error.message.toLowerCase().includes("invalid_grant");
  };

  const normalizeEmail = (email?: string) => {
    return String(email || "")
      .normalize("NFKC")
      .trim()
      .toLowerCase()
      .replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, "");
  };

  const oauthSignIn = (
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    loginHint?: string
  ): Promise<OAuthTokens | null> => {
    if (signingInRef.current) {
      console.warn("OAuth sign-in is already running. Skip duplicate popup.");
      toast.warning("Đang mở cửa sổ đăng nhập Google, vui lòng hoàn tất trước.");
      return Promise.resolve(null);
    }

    signingInRef.current = true;

    const authParams = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.send",
      access_type: "offline",
      prompt: "consent select_account",
    });

    if (loginHint) {
      authParams.set("login_hint", loginHint);
    }

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

    const popup = window.open(authUrl, "_blank", "width=600,height=600");

    if (!popup) {
      signingInRef.current = false;
      toast.error("Popup bị chặn. Vui lòng cho phép popup từ trình duyệt");
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      let finished = false;

      const finish = (callback: () => void) => {
        if (finished) return;

        finished = true;
        signingInRef.current = false;
        cleanup();
        callback();
      };

      const safeClosePopup = () => {
        try {
          popup.close();
        } catch (error) {
          console.warn("Unable to close Google OAuth popup:", error);
        }
      };

      const cleanup = () => {
        window.removeEventListener("message", handler);
        // clearInterval(popupClosedTimer);
        clearTimeout(popupTimeout);
      };

      // const popupClosedTimer = window.setInterval(() => {
      //   let popupWasClosed = false;

      //   try {
      //     popupWasClosed = popup.closed;
      //   } catch {
      //     return;
      //   }

      //   if (!popupWasClosed) return;

      //   finish(() => {
      //     toast.error("Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất");
      //     resolve(null);
      //   });
      // }, 500);

      const popupTimeout = window.setTimeout(() => {
        finish(() => {
          safeClosePopup();
          toast.error("Quá thời gian xác thực Google. Vui lòng kiểm tra Redirect URI.");
          resolve(null);
        });
      }, 120000);

      const handler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        const error = event.data?.error;

        if (error) {
          finish(() => {
            safeClosePopup();
            reject(new Error(error));
          });
          return;
        }

        const code = event.data?.code;
        if (!code) return;

        finish(async () => {
          safeClosePopup();

          try {
            const tokens = await exchangeCodeForTokens(clientId, clientSecret, redirectUri, code);
            resolve(tokens);
          } catch (err) {
            console.error("Lỗi đổi mã code:", err);
            reject(err);
          }
        });
      };

      window.addEventListener("message", handler);
    });
  };

  const exchangeCodeForTokens = async (
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    code: string
  ): Promise<OAuthTokens> => {
    const tokenUrl = "https://oauth2.googleapis.com/token";

    const data = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    });

    const tokenData = await response.json();

    if (!response.ok) {
      console.error("Token error:", tokenData);
      throw new Error(getErrorMessage("Lỗi khi đổi mã code lấy token.", tokenData));
    }

    if (!tokenData.access_token || !tokenData.refresh_token) {
      console.error("Google token response missing token:", tokenData);

      throw new Error(
        "Google không trả về đủ access_token/refresh_token. Vui lòng đăng nhập lại và chọn consent."
      );
    }

    return {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    };
  };

  const getNewAccessToken = async (
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): Promise<string> => {
    const tokenUrl = "https://oauth2.googleapis.com/token";

    const data = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    });

    const tokenData = await response.json();

    if (!response.ok) {
      console.error("Refresh token error:", tokenData);
      throw new Error(getErrorMessage("Lỗi khi lấy Token mới.", tokenData));
    }

    if (!tokenData.access_token) {
      console.error("Google refresh response missing access_token:", tokenData);
      throw new Error("Google không trả về access_token mới.");
    }

    return tokenData.access_token;
  };

  const getUserInfo = async (accessToken: string): Promise<GoogleUserInfo> => {
    if (!accessToken) {
      throw new Error("Thiếu access token khi lấy thông tin Google user.");
    }

    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userInfo = await response.json();

    if (!response.ok) {
      console.error("User info error:", userInfo);
      throw new Error(getErrorMessage(`Lỗi khi lấy thông tin người dùng: ${response.status}`, userInfo));
    }

    return userInfo;
  };

  const validateGmailConfig = async (formData: any): Promise<OAuthTokens | null> => {
    console.count("validateGmailConfig called");
    console.trace("validateGmailConfig trace");

    if (validatingRef.current) {
      console.warn("Gmail validation is already running. Skip duplicate call.");
      toast.warning("Đang xác thực Gmail, vui lòng chờ...");
      return null;
    }

    validatingRef.current = true;
    setLoading(true);

    try {
      const clientId = formData.ClientId?.trim();
      const clientSecret = formData.ClientSecret?.trim();
      const redirectUri = formData.RedirectUri?.trim();
      const senderEmail = formData.SenderEmail?.trim();

      if (!clientId || !clientSecret || !redirectUri || !senderEmail) {
        toast.error("Vui lòng nhập đầy đủ Email, Client ID, Client Secret và Redirect URI");
        return null;
      }

      if (new URL(redirectUri).origin !== window.location.origin) {
        toast.error(`Redirect URI phải cùng origin với trang hiện tại: ${window.location.origin}`);
        return null;
      }

      let accessToken = formData.Token?.trim();
      let refreshToken = formData.RefreshToken?.trim();
      let userInfo: GoogleUserInfo | null = null;

      const signInAgain = async (reason: string) => {
        console.count("signInAgain called");
        console.trace(`signInAgain trace - reason: ${reason}`);

        // Xóa token cũ trước khi login lại
        formData.Token = "";
        formData.RefreshToken = "";
        accessToken = "";
        refreshToken = "";

        const tokens = await oauthSignIn(clientId, clientSecret, redirectUri, senderEmail);

        console.log("Tokens from signInAgain:", tokens);

        if (!tokens) {
          toast.error("Cần đăng nhập vào Google trước khi lưu cấu hình");
          return null;
        }

        accessToken = tokens.accessToken;
        refreshToken = tokens.refreshToken;

        formData.Token = accessToken;
        formData.RefreshToken = refreshToken;

        return tokens;
      };

      // 1. Nếu chưa có token thì bắt đăng nhập Google
      if (!accessToken || !refreshToken) {
        const tokens = await signInAgain("missing accessToken or refreshToken");
        if (!tokens) return null;
      }

      if (!accessToken || !refreshToken) {
        toast.error("Không lấy được token Google. Vui lòng đăng nhập lại.");
        return null;
      }

      // 2. Test access token bằng API userinfo
      try {
        userInfo = await getUserInfo(accessToken);
      } catch (userInfoError) {
        console.warn("Access token may be expired. Try refresh token...", userInfoError);

        try {
          accessToken = await getNewAccessToken(clientId, clientSecret, refreshToken);
          formData.Token = accessToken;

          userInfo = await getUserInfo(accessToken);
        } catch (refreshError) {
          console.warn("Refresh token failed:", refreshError);

          if (!isInvalidGrant(refreshError)) {
            throw refreshError;
          }

          toast.warning("Phiên Google đã hết hạn hoặc bị thu hồi. Vui lòng đăng nhập Google lại.");

          const tokens = await signInAgain("refresh token invalid_grant");
          if (!tokens) return null;

          userInfo = await getUserInfo(tokens.accessToken);
        }
      }

      // 3. Nếu không lấy được email thì báo lỗi
      if (!userInfo?.email) {
        toast.error("Không lấy được email từ tài khoản Google. Vui lòng cấp quyền và thử lại.");
        return null;
      }

      // 4. Nếu email Google không khớp SenderEmail thì yêu cầu chọn lại tài khoản
      // if (userInfo.email.toLowerCase() !== senderEmail.toLowerCase()) {
      //   console.warn("Google email does not match SenderEmail", {
      //     googleEmail: userInfo.email,
      //     senderEmail,
      //   });

      //   toast.warning(
      //     `Email Google đang đăng nhập là ${userInfo.email}, không khớp với email người gửi ${senderEmail}. Vui lòng sửa Sender Email hoặc đăng nhập đúng tài khoản Google.`
      //   );

      //   return null;
      // }

      const googleEmail = normalizeEmail(userInfo.email);
      const inputSenderEmail = normalizeEmail(senderEmail);
      console.log("Normalized emails:", { googleEmail, inputSenderEmail });

      console.log("Compare email:", {
        rawGoogleEmail: userInfo.email,
        rawSenderEmail: senderEmail,
        googleEmail,
        inputSenderEmail,
        googleEmailLength: googleEmail.length,
        senderEmailLength: inputSenderEmail.length,
      });

      if (googleEmail !== inputSenderEmail) {
        toast.warning(
          `Email Google đang đăng nhập là ${userInfo.email}, không khớp với email người gửi ${senderEmail}. Vui lòng sửa Sender Email hoặc đăng nhập đúng tài khoản Google.`
        );

        return null;
      }

      if (!accessToken || !refreshToken) {
        toast.error("Token Google không hợp lệ sau khi xác thực.");
        return null;
      }

      toast.success("Xác thực Gmail thành công");

      return {
        accessToken,
        refreshToken,
      };
    } catch (err: any) {
      console.error("Gmail config validation failed:", err);
      toast.error(`Lỗi khi xác thực Gmail: ${err.message || "Không xác định"}`);
      return null;
    } finally {
      validatingRef.current = false;
      setLoading(false);
    }
  };

  return {
    validateGmailConfig,
    loading,
  };
};