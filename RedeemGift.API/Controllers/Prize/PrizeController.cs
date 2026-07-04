using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RedeemGiftAPI.Domain.BUS.Prize;
using RedeemGiftAPI.Models.Prize.Inputs;

namespace RedeemGiftAPI.Controllers.Prize
{
    [Authorize]
    [Route("api/prize/[action]")]
    public class PrizeController : BaseController
    {
        private readonly IPrizeBUS _prizeBUS;

        public PrizeController(IHttpContextAccessor httpContextAccessor, IPrizeBUS prizeBUS) : base(httpContextAccessor)
        {
            _prizeBUS = prizeBUS;
        }

        [HttpPost]
        public IActionResult InsertPrize([FromForm] InsertPrizeInput bo)
        {
            int result = _prizeBUS.InsertPrize(bo, _userLogin);
            _responseMessage = _prizeBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult DeletePrize(DeletePrizeInput bo)
        {
            int result = _prizeBUS.DeletePrize(bo, _userLogin);
            _responseMessage = _prizeBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult UpdatePrize([FromForm] UpdatePrizeInput bo)
        {
            int result = _prizeBUS.UpdatePrize(bo, _userLogin);
            _responseMessage = _prizeBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult PrizeGetPagedList(string keySearch, string projectCode, int status = -1, string sort = "ProjectCode", string order = "desc", int pageSize = 10, int offset = 0)
        {
            var results = _prizeBUS.PrizeGetPagedList(keySearch, projectCode, status, sort, order, pageSize, offset);
            _responseMessage = _prizeBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult GetPrizesByProject(string projectCode)
        {
            var results = _prizeBUS.GetPrizesByProject(projectCode);
            _responseMessage = _prizeBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }
    }
}
