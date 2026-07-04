using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RedeemGiftAPI.Domain.BUS.Gift;
using RedeemGiftAPI.Models.Gift.Inputs;

namespace RedeemGiftAPI.Controllers.Gift
{
    [Authorize]
    [Route("api/gift/[action]")]
    public class GiftController : BaseController
    {
        private readonly IGiftBUS _giftBUS;

        public GiftController(IHttpContextAccessor httpContextAccessor, IGiftBUS giftBUS) : base(httpContextAccessor)
        {
            _giftBUS = giftBUS;
        }

        [HttpGet]
        public IActionResult GiftGetPagedList(string keySearch, string projectCode, int status = -1, string sort = "ProjectCode", string order = "desc", int pageSize = 10, int offset = 0)
        {
            var results = _giftBUS.GiftGetPagedList(keySearch, projectCode, status, sort, order, pageSize, offset);
            _responseMessage = _giftBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult UpdateGiftStatus(int id, int status)
        {
            int result = _giftBUS.UpdateGiftStatus(id, status, _userLogin);
            _responseMessage = _giftBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult InsertGift([FromForm] InsertGiftInput bo)
        {
            int result = _giftBUS.InsertGift(bo, _userLogin);
            _responseMessage = _giftBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult UpdateGift([FromForm] UpdateGiftInput bo)
        {
            int result = _giftBUS.UpdateGift(bo, _userLogin);
            _responseMessage = _giftBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }
    }
}
