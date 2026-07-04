using RedeemGiftAPI.Models.Common.Outputs;

namespace RedeemGiftAPI.Domain.BUS
{
    public interface IBaseBUS
    {
        public ResponseMessage GetResponseMessage();
    }
    public class BaseBUS
    {
        public readonly string FOLDER_FILE = "img/uploadfile/";
        public readonly string strYearMonth = $"{DateTime.Now.Year}/{DateTime.Now.Month}/";
        public ResponseMessage _responseMessage = new ResponseMessage();

        private readonly IHttpContextAccessor _httpContextAccessor;

        public BaseBUS(IHttpContextAccessor httpContextAccessor)
        {
            _responseMessage.Status = MessageStatus.Success;
            _responseMessage.Message = string.Empty;
            _httpContextAccessor = httpContextAccessor;
        }

        public ResponseMessage GetResponseMessage()
        {
            return _responseMessage;
        }

        public string _baseURL => $"{_httpContextAccessor.HttpContext!.Request.Scheme}://{_httpContextAccessor.HttpContext.Request.Host}/";

        private string GetUserLogin()
        {
            return _httpContextAccessor.HttpContext!.Request.Headers["_userLogin"].ToString();
        }

        protected string _userLogin => GetUserLogin();
    }
}
