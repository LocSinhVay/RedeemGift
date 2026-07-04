import { useState, useEffect } from "react";
import { getAllEmailConfig } from "@/controllers/EmailConfigController";

type EmailConfigOption = { value: string; label: string; isActive: boolean };

export const useEmailConfigs = (trigger: boolean) => {
  const [emailConfig, setEmailConfig] = useState<EmailConfigOption[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const fetchEmailConfigs = async () => {
      try {
        const result = await getAllEmailConfig();
        if (Array.isArray(result?.Data)) {
          const emailConfigOptions: EmailConfigOption[] = result.Data.map((item: any) => ({
            value: String(item.EmailId),
            label: item.SenderEmail,
            isActive: item.IsActive
          }));
          setEmailConfig(emailConfigOptions);
        }
      } catch (error) {
        console.error("Lỗi hiển thị Email Config:", error);
      }
    };

    fetchEmailConfigs();
  }, [trigger]);

  return emailConfig;
};
