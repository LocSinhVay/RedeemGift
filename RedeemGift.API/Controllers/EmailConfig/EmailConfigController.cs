using RedeemGiftAPI.Domain.BUS.EmailConfig;
using RedeemGiftAPI.Models.EmailConfig.Inputs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RedeemGiftAPI.Controllers.EmailConfig
{
    [Authorize]
    [Route("api/emailConfig/[action]")]
    public class EmailConfigController : BaseController
    {
        private readonly IEmailConfigBUS _emailConfigBUS;

        public EmailConfigController(IHttpContextAccessor httpContextAccessor, IEmailConfigBUS emailConfigBUS) : base(httpContextAccessor)
        {
            _emailConfigBUS = emailConfigBUS;
        }

        [HttpPost]
        public IActionResult Insert([FromForm] InsertEmailConfigInput bo)
        {
            int result = _emailConfigBUS.Insert(bo, _userLogin);
            _responseMessage = _emailConfigBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult Delete(DeleteEmailConfigInput bo)
        {
            int result = _emailConfigBUS.Delete(bo, _userLogin);
            _responseMessage = _emailConfigBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult Update([FromForm] UpdateEmailConfigInput bo)
        {
            int result = _emailConfigBUS.Update(bo, _userLogin);
            _responseMessage = _emailConfigBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult EmailConfigGetPagedList(string type, int status = -1, string sort = "SenderEmail", string order = "desc", int pageSize = 10, int offset = 0)
        {
            var results = _emailConfigBUS.GetPagedList(type, status, sort, order, pageSize, offset);
            _responseMessage = _emailConfigBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult GetAllEmailConfig()
        {
            var results = _emailConfigBUS.GetAll();
            _responseMessage = _emailConfigBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult ChooseEmailConfig(ChooseEmailConfigInput bo)
        {
            int result = _emailConfigBUS.ChooseEmailConfig(bo, _userLogin);
            _responseMessage = _emailConfigBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }
    }
}
