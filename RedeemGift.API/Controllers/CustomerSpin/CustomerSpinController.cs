using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RedeemGiftAPI.Domain.BUS.CustomerSpin;
using RedeemGiftAPI.Models.CustomerSpin.Inputs;

namespace RedeemGiftAPI.Controllers.CustomerSpin
{
    [Authorize]
    [Route("api/customerSpin/[action]")]
    public class CustomerSpinController : BaseController
    {
        private readonly ICustomerSpinBUS _customerSpinBUS;

        public CustomerSpinController(IHttpContextAccessor httpContextAccessor, ICustomerSpinBUS customerSpinBUS) : base(httpContextAccessor)
        {
            _customerSpinBUS = customerSpinBUS;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSpinGrant([FromForm] SpinGrantInput bo)
        {
            var result = await _customerSpinBUS.CreateSpinGrantAsync(bo, _userLogin);
            _responseMessage = _customerSpinBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult CustomerSpinGetPagedList(string keySearch, string projectCode, string sort = "ProjectCode", string order = "desc", int pageSize = 10, int offset = 0)
        {
            var results = _customerSpinBUS.CustomerSpinGetPagedList(keySearch, projectCode, sort, order, pageSize, offset);
            _responseMessage = _customerSpinBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult WinningsGetPagedList(string qrCode, string sort = "WonAt", string order = "desc", int pageSize = 5, int offset = 0)
        {
            var results = _customerSpinBUS.WinningsGetPagedList(qrCode, sort, order, pageSize, offset);
            _responseMessage = _customerSpinBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }
    }
}
