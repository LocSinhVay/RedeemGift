export const allowPositiveNumbersOnly = (
  input: string,
  type: "phone" | "decimal" | "coordinate" | null = null
): string => {
  // B1: chỉ giữ lại số, 1 dấu chấm, và 1 dấu trừ ở đầu
  let cleaned = input.replace(/[^0-9.\-]/g, "");

  // B2: chỉ cho phép dấu '-' ở đầu
  cleaned = cleaned.replace(/(?!^)-/g, "");

  // B3: chỉ giữ lại 1 dấu '.'
  const parts = cleaned.split(".");
  if (parts.length > 2) {
    cleaned = parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
  }

  // 🔹 Xử lý cho tọa độ & số thập phân
  if (type === "decimal" || type === "coordinate") {
    const [intPartRaw, decPartRaw] = cleaned.split(".");
    const isNegative = intPartRaw.startsWith("-");
    const intPart = intPartRaw.replace("-", "") || "";
    const decPart = decPartRaw ? decPartRaw.slice(0, 15) : "";

    let value = "";

    if (decPartRaw !== undefined) {
      // Có dấu '.' (kể cả khi chưa nhập phần thập phân)
      value = `${isNegative ? "-" : ""}${intPart}.${decPart}`;
    } else {
      // Không có dấu '.'
      value = `${isNegative ? "-" : ""}${intPart}`;
    }

    return value;
  }

  // 🔹 Xử lý cho số điện thoại
  if (type === "phone") {
    return cleaned.replace(/\D/g, "").slice(0, 12);
  }

  // 🔹 Mặc định: số nguyên dương có format dấu phẩy
  const digits = cleaned.replace(/\D/g, "").replace(/^0+(?!$)/, "");
  return digits ? Number(digits).toLocaleString("en-US") : "0";
};


