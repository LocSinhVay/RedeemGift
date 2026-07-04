// using RedeemGiftAPI.Common.Outputs;
// using RedeemGiftAPI.Warehouse.Outputs;
using DinkToPdf.Contracts;
using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Models.Common.Outputs;

namespace RedeemGiftAPI.Domain.BUS.Common
{
    public interface IFileBUS : IBaseBUS
    {
        public string UploadFile(UploadFile bo);
        public Stream DownLoadFile(DownloadFile bo, ref string fileName);
        public Stream DownLoadErrorFile(DownloadFile bo, ref string fileName);
        //public MemoryStream DownloadReceiptPdf(List<GetListWarehouseReceiptModelOutput> bo);
    }
    public class FileBUS : BaseBUS, IFileBUS
    {
        private readonly string STR_YEARMONTH_FOLDER_FILE = $"{DateTime.Now.Year}\\{DateTime.Now.Month}";
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IConverter _converter;

        public FileBUS(IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment, IConverter converter) : base(httpContextAccessor)
        {
            _hostingEnvironment = hostingEnvironment;
            _converter = converter;
        }

        public Stream DownLoadFile(DownloadFile bo, ref string fileName)
        {
            Stream fileResult = null;
            try
            {
                string rootFolder = _hostingEnvironment.WebRootPath + "\\" + "Templates\\";
                if (File.Exists(rootFolder + bo.FolderFile))
                {
                    fileName = Path.GetFileName(rootFolder + bo.FolderFile);
                    fileResult = new FileStream(rootFolder + bo.FolderFile, FileMode.Open, FileAccess.Read);
                }
                else
                {
                    _responseMessage.Message = "Không tìm thấy file này trong hệ thống";
                    _responseMessage.Status = MessageStatus.Warning;
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Message = objEx.Message;
                _responseMessage.Status = MessageStatus.Error;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "DownLoadFile_FileBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return fileResult;
        }

        public Stream DownLoadErrorFile(DownloadFile bo, ref string fileName)
        {
            Stream fileResult = null;
            try
            {
                string rootFolder = _hostingEnvironment.WebRootPath + "\\" + "importError\\";
                if (File.Exists(rootFolder + bo.FolderFile))
                {
                    fileName = Path.GetFileName(rootFolder + bo.FolderFile);
                    fileResult = new FileStream(rootFolder + bo.FolderFile, FileMode.Open, FileAccess.Read);
                }
                else
                {
                    _responseMessage.Message = "Không tìm thấy file này trong hệ thống";
                    _responseMessage.Status = MessageStatus.Warning;
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Message = objEx.Message;
                _responseMessage.Status = MessageStatus.Error;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "DownLoadErrorFile_FileBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return fileResult;
        }

        public string UploadFile(UploadFile bo)
        {
            string result = string.Empty;
            try
            {
                string rootFolder = _hostingEnvironment.WebRootPath + "\\" + "uploadFile\\";
                string folder = bo.Directory + "\\" + STR_YEARMONTH_FOLDER_FILE + "\\";
                string fullFolder = rootFolder + folder;

                if (!Directory.Exists(fullFolder)) Directory.CreateDirectory(fullFolder);
                File.WriteAllBytes(fullFolder + bo.FileName, CommonHelper.FromBase64String(bo.Base64));
                result = folder + bo.FileName;
            }
            catch (Exception objEx)
            {
                _responseMessage.Message = objEx.Message;
                _responseMessage.Status = MessageStatus.Error;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "UploadFile_FileBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return result;
        }

        //public MemoryStream DownloadReceiptPdf(List<GetListWarehouseReceiptModelOutput> bo)
        //{
        //    try
        //    {
        //        string rootPath = _hostingEnvironment.WebRootPath + "\\" + "Templates\\";
        //        var templatePath = Path.Combine(rootPath, $"{bo[0].ReceiptType}.html");

        //        // Đọc nội dung file template
        //        if (!File.Exists(templatePath))
        //        {
        //            _responseMessage.Message = "Không tìm thấy file này trong hệ thống";
        //            _responseMessage.Status = MessageStatus.Warning;
        //            return null; // Trả về một stream rỗng
        //        }
        //        var htmlTemplate = File.ReadAllText(templatePath);

        //        var productRows = new StringBuilder();
        //        int index = 1; // Initialize STT
        //        foreach (var item in bo)
        //        {
        //            productRows.Append($@"
        //            <tr>
        //                <td>{index++}</td>
        //                <td style='text-align: left;'>{item.ProductCode}</td>
        //                <td style='text-align: left;'>{item.ProductName}</td>
        //                <td>{item.UnitName}</td>
        //                <td></td>
        //                <td>{item.Quantity.ToString("N0", CultureInfo.InvariantCulture)}</td>
        //                <td>{item.Price.ToString("N0", CultureInfo.InvariantCulture)}</td>
        //                <td>{item.Amount.ToString("N0", CultureInfo.InvariantCulture)}</td>
        //                <td style='text-align: left;'>{item.Description}</td>
        //            </tr>");
        //        }

        //        htmlTemplate = htmlTemplate
        //            .Replace("{{ReceiptCode}}", bo[0]?.ReceiptCode ?? "")
        //            .Replace("{{Date}}", bo[0]?.Date ?? "")
        //            .Replace("{{ToAddress}}", bo[0]?.ToAddress ?? "")
        //            .Replace("{{FromAddress}}", bo[0]?.FromAddress ?? "")
        //            .Replace("{{AM}}", bo[0]?.AM ?? "")
        //            .Replace("{{ProjectName}}", bo[0]?.ProjectName ?? "")
        //            .Replace("{{Deliverer}}", bo[0]?.Deliverer ?? "")
        //            .Replace("{{DeliveryCompany}}", bo[0]?.DeliveryCompany ?? "")
        //            .Replace("{{Phone}}", bo[0]?.Phone ?? "")
        //            .Replace("{{Reason}}", bo[0]?.Reason ?? "")
        //            .Replace("{{AmountTotal}}", bo[0]?.AmountTotal.ToString("N0", CultureInfo.InvariantCulture) ?? "")
        //            .Replace("{{AmountTotalToWords}}", bo[0]?.AmountTotalToWords ?? "")
        //            .Replace("{{ReceiptCreator}}", bo[0]?.ReceiptCreator ?? "")
        //            .Replace("{{ProductRows}}", productRows.ToString());

        //        var pdfData = GeneratePdf(htmlTemplate);

        //        return new MemoryStream(pdfData);
        //    }
        //    catch (Exception objEx)
        //    {
        //        _responseMessage.Message = objEx.Message;
        //        _responseMessage.Status = MessageStatus.Error;

        //        // Gọi hàm InsertLog để log lỗi
        //        _ = LogHelper.InsertLog(
        //            title: "DownloadReceiptPdf_FileBUS",
        //            content: objEx.Message,
        //            source: "RedeemGiftAPI",
        //            userLogin: _userLogin,
        //            parameter: bo
        //        );
        //        return null;
        //    }
        //}

        //private byte[] GeneratePdf(string htmlContent)
        //{
        //    try
        //    {
        //        var globalSettings = new GlobalSettings
        //        {
        //            ColorMode = ColorMode.Color,
        //            Orientation = Orientation.Portrait,
        //            PaperSize = PaperKind.A4,
        //            DocumentTitle = "Receipt PDF",
        //        };

        //        var objectSettings = new ObjectSettings
        //        {
        //            PagesCount = true,
        //            HtmlContent = htmlContent,
        //            WebSettings = { DefaultEncoding = "utf-8" },
        //            FooterSettings = { FontSize = 9, Center = "Trang  [page] / [toPage]" }
        //        };

        //        var pdf = new HtmlToPdfDocument()
        //        {
        //            GlobalSettings = globalSettings,
        //            Objects = { objectSettings }
        //        };

        //        return _converter.Convert(pdf); // Trả về file PDF dưới dạng byte[]
        //    }
        //    catch (Exception ex)
        //    {
        //        // Log lỗi tại đây
        //        throw new Exception("Lỗi khi tạo PDF", ex);
        //    }
        //}
    }
}
