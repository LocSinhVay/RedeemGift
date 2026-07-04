using RedeemGiftAPI.Models.Common.Outputs;
using Microsoft.AspNetCore.StaticFiles;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Text.RegularExpressions;

namespace RedeemGiftAPI.Domain.BUS.Helper
{
    public static class CommonHelper
    {

        public static string GetContentType(string fileName)
        {
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(fileName, out string contentType))
            {
                contentType = "application/octet-stream"; // Default content type
            }
            return contentType;
        }

        public static byte[] FromBase64String(this string base64String)
        {
            Regex regex = new Regex(@"^[\w/\:.-]+;base64,");
            var strBase64 = regex.Replace(base64String, string.Empty);
            return Convert.FromBase64String(strBase64);
        }

        public static ExcelWorkbook LoadWorkbookFromBytes(ExcelPackage package, byte[] bytes)
        {
            using (var stream = new MemoryStream(bytes))
            {
                package.Load(stream);
                return package.Workbook;
            }
        }

        public static DataTable ToDataTable(ExcelWorksheet workSheet, ref ResponseMessage message)
        {
            int i = 0, j = 0;
            try
            {
                message.Message = string.Empty;
                DataTable table = new DataTable();

                var noOfCol = workSheet.Dimension.End.Column;
                var noOfRow = workSheet.Dimension.End.Row;
                for (i = 1; i <= noOfCol; i++)
                {
                    var code = workSheet.Cells[1, i].Value.ToString();
                    table.Columns.Add(code, typeof(string));
                }
                object[] values = new object[table.Columns.Count];
                for (i = 2; i <= noOfRow; i++)
                {
                    for (j = 1; j <= values.Length; j++)
                    {
                        values[j - 1] = workSheet.Cells[i, j].Value;
                    }
                    table.Rows.Add(values);
                }
                return table;
            }
            catch
            {
                message.Message = string.Format("Lỗi kiểu dữ liệu dòng thứ {0} cột {1}", i.ToString(), j.ToString());
                message.Status = MessageStatus.Error;
                return null;
            }
        }

        public static DataTable ImportWkpInsertToDataTable(ExcelWorksheet workSheet, ref ResponseMessage message)
        {
            int row = 0, col = 0;
            try
            {
                message.Message = string.Empty;
                DataTable table = new DataTable();

                // Định nghĩa cấu trúc bảng
                table.Columns.Add("WorkDate", typeof(string));
                table.Columns.Add("StaffCode", typeof(string));
                table.Columns.Add("StoreID", typeof(string));
                table.Columns.Add("ShiftIn", typeof(string));
                table.Columns.Add("ShiftOut", typeof(string));

                int noOfCol = workSheet.Dimension.End.Column;
                int noOfRow = workSheet.Dimension.End.Row;

                // Đọc tiêu đề cột
                var headers = new List<string>();
                for (col = 1; col <= noOfCol; col++)
                {
                    var header = workSheet.Cells[1, col].Text.Trim();
                    headers.Add(header);
                }

                // Lấy chỉ số các cột cố định (tường minh)
                int workDateIndex = headers.FindIndex(h => string.Equals(h, "WorkDate", StringComparison.OrdinalIgnoreCase)) + 1;
                int staffCodeIndex = headers.FindIndex(h => string.Equals(h, "StaffCode", StringComparison.OrdinalIgnoreCase)) + 1;
                int storeIDIndex = headers.FindIndex(h => string.Equals(h, "StoreID", StringComparison.OrdinalIgnoreCase)) + 1;

                var missingCols = new List<string>();
                if (workDateIndex == 0) missingCols.Add("WorkDate");
                if (staffCodeIndex == 0) missingCols.Add("StaffCode");
                if (storeIDIndex == 0) missingCols.Add("StoreID");

                if (missingCols.Any())
                {
                    message.Message = $"Thiếu cột bắt buộc: {string.Join(", ", missingCols)}.";
                    message.Status = MessageStatus.Error;
                    return null;
                }

                // Tìm các cặp ShiftIn / ShiftOut
                var shiftColumns = new List<(int ShiftInCol, int ShiftOutCol, int ShiftIndex)>();
                for (int i = 0; i < headers.Count; i++)
                {
                    if (headers[i].ToLower().Contains("shift") && headers[i].ToLower().Contains("in"))
                    {
                        string baseName = headers[i].Replace("In", "", StringComparison.OrdinalIgnoreCase).Trim();
                        int inIndex = i + 1;
                        int outIndex = headers.FindIndex(i + 1, h => h.Replace("Out", "", StringComparison.OrdinalIgnoreCase).Trim() == baseName) + 1;

                        if (outIndex > 0)
                            shiftColumns.Add((inIndex, outIndex, shiftColumns.Count + 1));
                    }
                }

                var groupedShifts = new Dictionary<string, List<(TimeSpan In, TimeSpan Out, int ExcelRow)>>();

                for (row = 2; row <= noOfRow; row++)
                {
                    string workDate = workSheet.Cells[row, workDateIndex].Text.Trim();
                    string staffCode = workSheet.Cells[row, staffCodeIndex].Text.Trim();
                    string storeID = workSheet.Cells[row, storeIDIndex].Text.Trim();

                    string errorMessage = string.Empty;

                    if (string.IsNullOrWhiteSpace(workDate))
                        errorMessage += $"Dòng {row}: Chưa nhập ngày làm việc (WorkDate).\n";
                    if (string.IsNullOrWhiteSpace(staffCode))
                        errorMessage += $"Dòng {row}: Chưa nhập mã nhân viên (StaffCode).\n";
                    if (string.IsNullOrWhiteSpace(storeID))
                        errorMessage += $"Dòng {row}: Chưa nhập mã cửa hàng (StoreID).\n";

                    // Kiểm tra WorkDate hợp lệ và không nhỏ hơn hôm nay
                    if (!string.IsNullOrWhiteSpace(workDate))
                    {
                        if (!DateTime.TryParse(workDate, out DateTime parsedDate))
                        {
                            errorMessage += $"Dòng {row}: WorkDate không đúng định dạng ngày hợp lệ.\n";
                        }
                        else if (parsedDate.Date < DateTime.Today)
                        {
                            errorMessage += $"Dòng {row}: WorkDate ({parsedDate:dd/MM/yyyy}) không được nhỏ hơn ngày hiện tại ({DateTime.Today:dd/MM/yyyy}).\n";
                        }
                    }

                    if (!string.IsNullOrEmpty(errorMessage))
                    {
                        message.Message = errorMessage.Trim();
                        message.Status = MessageStatus.Error;
                        return null;
                    }

                    for (int s = 0; s < shiftColumns.Count; s++)
                    {
                        var (ShiftInCol, ShiftOutCol, shiftIndex) = shiftColumns[s];
                        var rawIn = workSheet.Cells[row, ShiftInCol];
                        var rawOut = workSheet.Cells[row, ShiftOutCol];

                        string shiftInStr = FormatTime(rawIn);
                        string shiftOutStr = FormatTime(rawOut);

                        bool hasIn = !string.IsNullOrEmpty(shiftInStr);
                        bool hasOut = !string.IsNullOrEmpty(shiftOutStr);

                        if (hasIn ^ hasOut)
                        {
                            message.Message = $"Dòng {row}: Ca Shift{shiftIndex} bị thiếu {(hasIn ? "Out" : "In")}.";
                            message.Status = MessageStatus.Error;
                            return null;
                        }

                        if (hasIn && hasOut)
                        {
                            if (!TimeSpan.TryParse(shiftInStr, out var shiftIn) || !TimeSpan.TryParse(shiftOutStr, out var shiftOut))
                            {
                                message.Message = $"Dòng {row}: Ca Shift{shiftIndex} định dạng thời gian không hợp lệ.";
                                message.Status = MessageStatus.Error;
                                return null;
                            }

                            if (shiftIn >= shiftOut)
                            {
                                message.Message = $"Dòng {row}: Ca Shift{shiftIndex}, giờ In phải nhỏ hơn Out.";
                                message.Status = MessageStatus.Error;
                                return null;
                            }

                            var newRow = table.NewRow();
                            newRow["WorkDate"] = FormatDate(workDate);
                            newRow["StaffCode"] = staffCode;
                            newRow["StoreID"] = storeID;
                            newRow["ShiftIn"] = shiftInStr;
                            newRow["ShiftOut"] = shiftOutStr;
                            table.Rows.Add(newRow);

                            string groupKey = $"{workDate}|{staffCode}";
                            if (!groupedShifts.ContainsKey(groupKey))
                                groupedShifts[groupKey] = new List<(TimeSpan, TimeSpan, int)>();
                            groupedShifts[groupKey].Add((shiftIn, shiftOut, row));
                        }
                    }
                }

                // Kiểm tra giao nhau các ca làm
                foreach (var group in groupedShifts)
                {
                    var shifts = group.Value;
                    for (int i = 0; i < shifts.Count; i++)
                    {
                        for (int j = i + 1; j < shifts.Count; j++)
                        {
                            if (IsOverlap(shifts[i].In, shifts[i].Out, shifts[j].In, shifts[j].Out))
                            {
                                message.Message = $"Dòng {shifts[i].ExcelRow}: giờ làm việc của ca làm bị giao nhau (cùng nhân viên và ngày).";
                                message.Status = MessageStatus.Error;
                                return null;
                            }
                        }
                    }
                }

                return table;
            }
            catch
            {
                message.Message = $"Lỗi đọc Excel dòng {row}, cột {col}";
                message.Status = MessageStatus.Error;
                return null;
            }
        }

        public static DataTable ImportWkpUpdateToDataTable(ExcelWorksheet worksheet, ref ResponseMessage message)
        {
            int row = 0, col = 0;
            message.Message = string.Empty;

            try
            {
                var table = new DataTable();
                table.Columns.Add("WkpDetailID", typeof(int));
                table.Columns.Add("StoreID", typeof(int));
                table.Columns.Add("TimeIn", typeof(TimeSpan));
                table.Columns.Add("TimeOut", typeof(TimeSpan));
                table.Columns.Add("Status", typeof(string));

                int noOfCol = worksheet.Dimension.End.Column;
                int noOfRow = worksheet.Dimension.End.Row;

                // Đọc header
                var headers = new List<string>();
                for (col = 1; col <= noOfCol; col++)
                    headers.Add(worksheet.Cells[1, col].Text.Trim());

                int idIndex = headers.FindIndex(h => h.Equals("WkpDetailID", StringComparison.OrdinalIgnoreCase)) + 1;
                int storeIndex = headers.FindIndex(h => h.Equals("StoreID", StringComparison.OrdinalIgnoreCase)) + 1;
                int inIndex = headers.FindIndex(h => h.Equals("TimeIn", StringComparison.OrdinalIgnoreCase)) + 1;
                int outIndex = headers.FindIndex(h => h.Equals("TimeOut", StringComparison.OrdinalIgnoreCase)) + 1;
                int statusIndex = headers.FindIndex(h => h.Equals("Status", StringComparison.OrdinalIgnoreCase)) + 1;

                var missing = new List<string>();
                if (idIndex == 0) missing.Add("WkpDetailID");
                if (storeIndex == 0) missing.Add("StoreID");
                if (inIndex == 0) missing.Add("TimeIn");
                if (outIndex == 0) missing.Add("TimeOut");
                if (statusIndex == 0) missing.Add("Status");

                if (missing.Count > 0)
                {
                    message.Message = $"Thiếu cột bắt buộc: {string.Join(", ", missing)}.";
                    message.Status = MessageStatus.Error;
                    return null;
                }

                for (row = 2; row <= noOfRow; row++)
                {
                    string idCell = worksheet.Cells[row, idIndex].Text.Trim();
                    string storeCell = worksheet.Cells[row, storeIndex].Text.Trim();
                    string inCell = worksheet.Cells[row, inIndex].Text.Trim();
                    string outCell = worksheet.Cells[row, outIndex].Text.Trim();
                    string statusCell = worksheet.Cells[row, statusIndex].Text.Trim();

                    // Kiểm tra rỗng từng trường
                    if (string.IsNullOrWhiteSpace(idCell))
                    {
                        message.Message = $"Dòng {row}: WkpDetailID không được để trống.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }
                    if (string.IsNullOrWhiteSpace(storeCell))
                    {
                        message.Message = $"Dòng {row}: StoreID không được để trống.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }
                    if (string.IsNullOrWhiteSpace(inCell))
                    {
                        message.Message = $"Dòng {row}: TimeIn không được để trống.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }
                    if (string.IsNullOrWhiteSpace(outCell))
                    {
                        message.Message = $"Dòng {row}: TimeOut không được để trống.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }
                    if (string.IsNullOrWhiteSpace(statusCell))
                    {
                        message.Message = $"Dòng {row}: Status không được để trống.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }

                    // Validate giá trị
                    if (!int.TryParse(idCell, out int wkpDetailID) || wkpDetailID <= 0)
                    {
                        message.Message = $"Dòng {row}: WkpDetailID không hợp lệ.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }

                    // Kiểm tra trùng ID
                    if (table.AsEnumerable().Any(r => r.Field<int>("WkpDetailID") == wkpDetailID))
                    {
                        message.Message = $"Dòng {row}: WkpDetailID ({wkpDetailID}) đã bị trùng.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }

                    if (!int.TryParse(storeCell, out int storeID) || storeID <= 0)
                    {
                        message.Message = $"Dòng {row}: StoreID không hợp lệ.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }

                    if (!TimeSpan.TryParse(inCell, out TimeSpan timeIn))
                    {
                        message.Message = $"Dòng {row}: TimeIn không hợp lệ.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }

                    if (!TimeSpan.TryParse(outCell, out TimeSpan timeOut))
                    {
                        message.Message = $"Dòng {row}: TimeOut không hợp lệ.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }

                    if (timeIn >= timeOut)
                    {
                        message.Message = $"Dòng {row}: TimeIn phải nhỏ hơn TimeOut.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }

                    string normalizedStatus = statusCell.Trim();
                    if (!string.Equals(normalizedStatus, "Activated", StringComparison.OrdinalIgnoreCase) &&
                        !string.Equals(normalizedStatus, "Blocked", StringComparison.OrdinalIgnoreCase))
                    {
                        message.Message = $"Dòng {row}: Status phải là 'Activated' hoặc 'Blocked'.";
                        message.Status = MessageStatus.Error;
                        return null;
                    }

                    // Thêm vào DataTable
                    var newRow = table.NewRow();
                    newRow["WkpDetailID"] = wkpDetailID;
                    newRow["StoreID"] = storeID;
                    newRow["TimeIn"] = timeIn;
                    newRow["TimeOut"] = timeOut;
                    newRow["Status"] = CultureInfo.InvariantCulture.TextInfo.ToTitleCase(normalizedStatus.ToLower());
                    table.Rows.Add(newRow);
                }

                return table;
            }
            catch (Exception ex)
            {
                message.Message = $"Lỗi tại dòng {row}, cột {col}: {ex.Message}";
                message.Status = MessageStatus.Error;
                return null;
            }
        }

        private static string FormatTime(ExcelRange cell)
        {
            if (cell?.Value == null) return null;

            if (cell.Value is DateTime dt)
                return dt.ToString("HH:mm");

            if (double.TryParse(cell.Value.ToString(), out double dbl))
                return DateTime.FromOADate(dbl).ToString("HH:mm");

            return cell.Text.Trim();
        }

        private static string FormatDate(string rawDate)
        {
            if (DateTime.TryParse(rawDate, out var dt))
                return dt.ToString("yyyy-MM-dd");

            return rawDate;
        }

        public static byte[] ExportFile(DataTable dtData, string title)
        {
            ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.Commercial;
            using var excelPackage = new ExcelPackage();
            var excelWorksheet = excelPackage.Workbook.Worksheets.Add("Sheet1");
            int row = 2;

            if (dtData != null && dtData.Rows.Count > 0)
            {
                // Title
                ExcelRange titleRange = excelWorksheet.Cells[row, 1, row, dtData.Columns.Count];
                titleRange.Value = title;
                titleRange.Style.Font.Size = 16;
                titleRange.Style.Font.Bold = true;
                titleRange.Merge = true;
                titleRange.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                titleRange.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                titleRange.Style.Fill.PatternType = ExcelFillStyle.Solid;
                titleRange.Style.Fill.BackgroundColor.SetColor(Color.Orange);

                row += 2;
                int col = 0;

                // Header
                foreach (DataColumn item in dtData.Columns)
                {
                    col++;
                    var headerCell = excelWorksheet.Cells[row, col];
                    headerCell.Value = item.ColumnName;
                    headerCell.Style.Font.Bold = true;
                    headerCell.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    headerCell.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    headerCell.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    headerCell.Style.Fill.BackgroundColor.SetColor(Color.Orange);
                    headerCell.Style.Border.BorderAround(ExcelBorderStyle.Thin);

                    // Format ngày
                    if (item.DataType == typeof(DateTime))
                        excelWorksheet.Column(col).Style.Numberformat.Format = "dd/MM/yyyy";

                    // Format tiền
                    if (item.DataType == typeof(decimal))
                    {
                        var temp = dtData.AsEnumerable().Where(x => x.Field<decimal?>(item) >= 1000);
                        excelWorksheet.Column(col).Style.Numberformat.Format = temp.Any() ? "#,##" : "";
                    }

                    // Format giờ
                    if (item.DataType == typeof(TimeSpan) ||
                       (item.DataType == typeof(string) && dtData.AsEnumerable().All(x => TimeSpan.TryParse(x[item]?.ToString(), out _))))
                    {
                        excelWorksheet.Column(col).Style.Numberformat.Format = "hh:mm:ss";
                    }
                }

                // Ghi dữ liệu
                excelWorksheet.Cells[row + 1, 1].LoadFromDataTable(dtData, false);

                int dataEndRow = row + dtData.Rows.Count;

                // Border cho vùng dữ liệu
                var dataRange = excelWorksheet.Cells[row, 1, dataEndRow, dtData.Columns.Count];
                dataRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                dataRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                dataRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                dataRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

                // Auto filter
                excelWorksheet.Cells[row, 1, row, dtData.Columns.Count].AutoFilter = true;

                // AutoFit
                excelWorksheet.Cells[excelWorksheet.Dimension.Address].AutoFitColumns();
            }

            return excelPackage.GetAsByteArray();
        }

        public static byte[] GenFileImport(DataTable dtData)
        {
            //excel
            ExcelPackage.LicenseContext = OfficeOpenXml.LicenseContext.Commercial;
            var excelPackage = new ExcelPackage();
            var excelWorksheet = excelPackage.Workbook.Worksheets.Add("Sheet1");
            int row = 1;
            // header
            if (dtData != null && dtData.Columns.Count > 0)
            {
                ExcelRange rangeex = excelWorksheet.Cells[row, 1, row, dtData.Columns.Count];
                var col = 0;
                foreach (DataColumn item in dtData.Columns)
                {
                    rangeex = excelWorksheet.Cells[row, ++col, row, col];
                    rangeex.Value = item.ColumnName;
                }
            }
            return excelPackage.GetAsByteArray();
        }

        public static bool IsPhoneNumber(string phoneNumber)
        {
            Regex regex = new Regex(@"^0[3|5|7|8|9]\d{8,9}$");
            return regex.IsMatch(phoneNumber);
        }

        public static bool IsValidEmail(string email)
        {
            Regex regex = new Regex(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$");
            return regex.IsMatch(email);
        }

        public static string GetBaseUrl(IHttpContextAccessor accessor)
        {
            var request = accessor.HttpContext?.Request;
            if (request == null) return string.Empty;

            return $"{request.Scheme}://{request.Host}{request.PathBase}";
        }

        public static bool IsTimeOutGreaterThanTimeIn(string timeIn, string timeOut)
        {
            // Chuyển đổi thời gian từ string sang TimeSpan
            TimeSpan timeInSpan;
            TimeSpan timeOutSpan;

            if (TimeSpan.TryParse(timeIn, out timeInSpan) && TimeSpan.TryParse(timeOut, out timeOutSpan))
            {
                return timeOutSpan > timeInSpan; // Kiểm tra xem giờ ra có lớn hơn giờ vào không
            }

            return false; // Nếu không thể chuyển đổi thành TimeSpan, trả về false
        }

        // Kiểm tra overlap giữa 2 ca
        public static bool IsOverlap(TimeSpan start1, TimeSpan end1, TimeSpan start2, TimeSpan end2)
        {
            return start1 < end2 && start2 < end1; // Có phần giao nhau
        }

        public static double CalculateDistance(double latitude1, double longitude1, double latitude2, double longitude2)
        {
            double circumference = 40075.6;
            double latitude1Rad = DegreesToRadians(latitude1);
            double longitude1Rad = DegreesToRadians(longitude1);

            double latititude2Rad = DegreesToRadians(latitude2);
            double longitude2Rad = DegreesToRadians(longitude2);
            double logitudeDiff = Math.Abs(longitude1Rad - longitude2Rad);

            if (logitudeDiff > Math.PI)
            {
                logitudeDiff = 2.0 * Math.PI - logitudeDiff;
            }

            double angleCalculation =
                Math.Acos(
                  Math.Sin(latititude2Rad) * Math.Sin(latitude1Rad) +
                  Math.Cos(latititude2Rad) * Math.Cos(latitude1Rad) * Math.Cos(logitudeDiff));

            return circumference * angleCalculation / (2.0 * Math.PI);
        }

        public static double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180.0;
        }

        public static async Task<byte[]> ReadFileBytesAsync(IFormFile file)
        {
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            return ms.ToArray();
        }
    }
}
