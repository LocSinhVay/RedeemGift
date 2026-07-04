using Microsoft.AspNetCore.Mvc;
using RedeemGiftAPI.Domain.BUS.CustomerSpin;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.CustomerSpin.Inputs;

namespace RedeemGiftAPI.Controllers.ClaimSpin
{
    [ApiController]
    [Route("api/claimSpin/[action]")]
    public class ClaimSpinController : Controller
    {
        private readonly ICustomerSpinBUS _customerSpinBUS;
        private ResponseMessage _apiResponseMessage = new ResponseMessage();

        public ClaimSpinController(
            ICustomerSpinBUS customerSpinBUS,
            IHttpContextAccessor httpContextAccessor)
        {
            _customerSpinBUS = customerSpinBUS;
            _apiResponseMessage.Status = MessageStatus.Success;
            _apiResponseMessage.Message = string.Empty;
        }

        //[HttpGet]
        //public IActionResult SpinInfoBySpinGrantIdGetDetail(string spinGrantId)
        //{
        //    var results = _customerSpinBUS.SpinInfoBySpinGrantIdGetDetail(spinGrantId);
        //    _apiResponseMessage = _customerSpinBUS.GetResponseMessage();
        //    _apiResponseMessage.Data = results;

        //    return Ok(_apiResponseMessage);
        //}

        [HttpGet]
        public async Task<IActionResult> SpinInfoBySpinGrantIdGetDetail(string spinGrantId)
        {
            var results = await _customerSpinBUS.SpinInfoBySpinGrantIdGetDetailAsync(spinGrantId);
            _apiResponseMessage = _customerSpinBUS.GetResponseMessage();
            _apiResponseMessage.Data = results;

            return Ok(_apiResponseMessage);
        }

        [HttpPost]
        public IActionResult ClaimSpins([FromForm] ClaimSpinsInput bo)
        {
            int result = _customerSpinBUS.ClaimSpins(bo);
            _apiResponseMessage = _customerSpinBUS.GetResponseMessage();
            _apiResponseMessage.Data = result;

            return Ok(_apiResponseMessage);
        }

        //[HttpPost]
        //public IActionResult SpinWheel(string spinGrantId)
        //{
        //    SpinWheelOutput result = _customerSpinBUS.SpinWheel(spinGrantId);
        //    _apiResponseMessage = _customerSpinBUS.GetResponseMessage();
        //    _apiResponseMessage.Data = result;

        //    return Ok(_apiResponseMessage);
        //}

        [HttpPost]
        public async Task<IActionResult> SpinWheel(string spinGrantId)
        {
            var result = await _customerSpinBUS.SpinWheelAsync(spinGrantId);
            _apiResponseMessage = _customerSpinBUS.GetResponseMessage();
            _apiResponseMessage.Data = result;

            return Ok(_apiResponseMessage);
        }

    }
}

