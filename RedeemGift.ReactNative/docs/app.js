const DOWNLOAD_PAGE_URL =
  "https://it-vayls.github.io/RedeemGift/";

function detectDevice() {
  const userAgent = navigator.userAgent.toLowerCase();

  if (userAgent.includes("android")) {
    return "android";
  }

  if (
    userAgent.includes("iphone") ||
    userAgent.includes("ipad") ||
    userAgent.includes("ipod")
  ) {
    return "ios";
  }

  return "desktop";
}

function showElement(elementId) {
  const element = document.getElementById(elementId);

  if (element) {
    element.classList.remove("hidden");
  }
}

function createQRCode() {
  const qrContainer = document.getElementById("qrcode");

  if (!qrContainer) {
    return;
  }

  if (typeof QRCode === "undefined") {
    qrContainer.textContent = "Không thể tạo mã QR.";
    return;
  }

  new QRCode(qrContainer, {
    text: DOWNLOAD_PAGE_URL,
    width: 190,
    height: 190,
    correctLevel: QRCode.CorrectLevel.H
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const device = detectDevice();

  if (device === "android") {
    showElement("androidContent");
    return;
  }

  if (device === "ios") {
    showElement("iosContent");
    return;
  }

  showElement("desktopContent");
  createQRCode();
});
