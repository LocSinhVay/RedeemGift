using RedeemGiftAPI.Domain.BUS.Common;
using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Models.Common.Outputs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RedeemGiftAPI.Controllers.Common
{
    [Authorize]
    [Route("api/file/[action]")]
    public class FileController : BaseController
    {
        private readonly IFileBUS _fileBUS;

        public FileController(IHttpContextAccessor httpContextAccessor, IFileBUS fileBUS) : base(httpContextAccessor)
        {
            _fileBUS = fileBUS;
        }

        [HttpPost]
        public IActionResult Uploadfile(UploadFile bo)
        {
            string result = _fileBUS.UploadFile(bo);
            _responseMessage = _fileBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult Downloadfile(DownloadFile bo)
        {
            string fileName = string.Empty;

            // Lấy dữ liệu file và tên file
            var fileResult = _fileBUS.DownLoadFile(bo, ref fileName);
            _responseMessage = _fileBUS.GetResponseMessage();

            // Nếu không có file trả về lỗi 404
            if (fileResult == null)
            {
                return NotFound(_responseMessage);
            }

            // Lấy content type theo file extension
            string contentType = CommonHelper.GetContentType(fileName);

            // (Không cần set thủ công Content-Disposition nếu dùng tham số fileDownloadName của File())
            return File(fileResult, contentType, fileName);
        }


        //[HttpPost]
        //public IActionResult downloadfile(DownloadFile bo)
        //{
        //    string fileName = string.Empty;
        //    var fileResult = _fileBUS.DownLoadFile(bo, ref fileName);
        //    _responseMessage = _fileBUS.GetResponseMessage();

        //    if (fileResult == null)
        //    {
        //        return NotFound(_responseMessage);
        //    }
        //    else
        //    {
        //        string contentType = CommonHelper.GetContentType(fileName);
        //        Response.Headers.Add("Access-Content-Disposition", $"attachment; filename=\"{fileName}\"");
        //        return File(fileResult, contentType, fileName);
        //    }
        //}

        //[HttpPost]
        //public IActionResult downloaderrorfile(DownloadFile bo)
        //{
        //    string fileName = string.Empty;
        //    var fileResult = _fileBUS.DownLoadErrorFile(bo, ref fileName);
        //    _responseMessage = _fileBUS.GetResponseMessage();

        //    if (fileResult == null)
        //    {
        //        return NotFound(_responseMessage);
        //    }
        //    else
        //    {
        //        string contentType = CommonHelper.GetContentType(fileName);
        //        Response.Headers.Add("Access-Content-Disposition", $"attachment; filename=\"{fileName}\"");
        //        return File(fileResult, contentType, fileName);
        //    }
        //}

        //[HttpPost]
        //public IActionResult downloadReceiptPdf(List<GetListWarehouseReceiptModelOutput> formData)
        //{
        //    var pdfStream = _fileBUS.DownloadReceiptPdf(formData);
        //    _responseMessage = _fileBUS.GetResponseMessage();

        //    if (pdfStream == null || pdfStream.Length == 0)
        //    {
        //        return NotFound(new { success = false, message = _responseMessage.Message });
        //    }

        //    return File(pdfStream, "application/pdf");
        //}
    }
}
