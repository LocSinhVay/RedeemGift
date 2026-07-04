namespace RedeemGiftAPI.Domain.BUS.Helper
{
    public interface IUploadFileHelper
    {
        string UploadFileImage(string base64, string fileName, string attachDir);
        Task<string> UploadFileImageAsync(string base64, string fileName, string attachDir);
        Task<string> UploadFileAsync(IFormFile file, string attachDir, string fileName = null);

        public string GetLinkImage(string fileName, string attachDir);

    }
    public class UploadFileHelper : IUploadFileHelper
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly string strYearMonth = $"{DateTime.Now.Year}\\{DateTime.Now.Month}";

        public UploadFileHelper(IWebHostEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }

        public string UploadFileImage(string base64, string fileName, string attachDir)
        {
            string folderPath = Path.Combine(_hostingEnvironment.WebRootPath, "img", "uploadfile", attachDir, strYearMonth);
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            string filePath = Path.Combine(folderPath, fileName);
            File.WriteAllBytes(filePath, CommonHelper.FromBase64String(base64));

            return $"{attachDir}/{strYearMonth.Replace("\\", "/")}/{fileName}";
        }

        public async Task<string> UploadFileImageAsync(string base64, string fileName, string attachDir)
        {
            string folderPath = Path.Combine(
                _hostingEnvironment.WebRootPath,
                "img",
                "uploadfile",
                attachDir,
                strYearMonth
            );

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            string filePath = Path.Combine(folderPath, fileName);

            byte[] bytes = CommonHelper.FromBase64String(base64);

            // Ghi file async thay vì block
            await File.WriteAllBytesAsync(filePath, bytes);

            return $"{attachDir}/{strYearMonth.Replace("\\", "/")}/{fileName}";
        }

        public async Task<string> UploadFileAsync(IFormFile file, string attachDir, string fileName = null)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File không hợp lệ!");

            string folderPath = Path.Combine(_hostingEnvironment.WebRootPath, "img", "uploadfile", attachDir);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            // Dùng tên truyền vào nếu có, nếu không thì lấy tên file gốc
            string finalFileName = string.IsNullOrWhiteSpace(fileName) ? file.FileName : fileName;
            string filePath = Path.Combine(folderPath, finalFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"{attachDir}/{finalFileName}";
        }

        public string GetLinkImage(string fileName, string attachDir)
        {
            return _hostingEnvironment.WebRootPath + "\\" + attachDir + "\\" + fileName;
        }
    }
}
