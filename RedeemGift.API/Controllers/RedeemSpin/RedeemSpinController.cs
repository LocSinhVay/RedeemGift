using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RedeemGiftAPI.Domain.BUS.RedeemSpin;
using RedeemGiftAPI.Models.RedeemSpin.Inputs;

namespace RedeemGiftAPI.Controllers.RedeemSpin
{
    [Authorize]
    [Route("api/redeemSpin/[action]")]
    public class RedeemSpinController : BaseController
    {
        private readonly IRedeemSpinBUS _redeemSpinBUS;

        public RedeemSpinController(IHttpContextAccessor httpContextAccessor, IRedeemSpinBUS redeemSpinBUS) : base(httpContextAccessor)
        {
            _redeemSpinBUS = redeemSpinBUS;
        }

        [HttpPost]
        public IActionResult InsertRedeemSpin([FromForm] InsertRedeemSpinInput bo)
        {
            int result = _redeemSpinBUS.InsertRedeemSpin(bo, _userLogin);
            _responseMessage = _redeemSpinBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult DeleteRedeemSpin(DeleteRedeemSpinInput bo)
        {
            int result = _redeemSpinBUS.DeleteRedeemSpin(bo, _userLogin);
            _responseMessage = _redeemSpinBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult UpdateRedeemSpin([FromForm] UpdateRedeemSpinInput bo)
        {
            int result = _redeemSpinBUS.UpdateRedeemSpin(bo, _userLogin);
            _responseMessage = _redeemSpinBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult RedemptionRuleByProjectGetList(string projectCode)
        {
            var results = _redeemSpinBUS.RedemptionRuleByProjectGetList(projectCode);
            _responseMessage = _redeemSpinBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult RedeemSpinGetPagedList(string keySearch, string projectCode, int status = -1, string sort = "ProjectCode", string order = "desc", int pageSize = 10, int offset = 0)
        {
            var results = _redeemSpinBUS.RedeemSpinGetPagedList(keySearch, projectCode, status, sort, order, pageSize, offset);
            _responseMessage = _redeemSpinBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }


    }
}
