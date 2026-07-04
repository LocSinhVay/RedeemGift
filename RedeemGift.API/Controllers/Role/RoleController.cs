using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RedeemGiftAPI.Domain.BUS.Role;
using RedeemGiftAPI.Models.Role.Inputs;

namespace RedeemGiftAPI.Controllers.Role
{
    [Authorize]
    [Route("api/role/[action]")]
    public class RoleController : BaseController
    {
        private readonly IRoleBUS _roleBUS;

        public RoleController(IHttpContextAccessor httpContextAccessor, IRoleBUS roleBUS) : base(httpContextAccessor)
        {
            _roleBUS = roleBUS;
        }

        [HttpPost]
        public IActionResult Insert(InsertRoleInput bo)
        {
            int result = _roleBUS.Insert(bo, _userLogin);
            _responseMessage = _roleBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult Delete(DeleteRoleInput bo)
        {
            int result = _roleBUS.Delete(bo, _userLogin);
            _responseMessage = _roleBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult Update(UpdateRoleInput bo)
        {
            int result = _roleBUS.Update(bo, _userLogin);
            _responseMessage = _roleBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult RoleGetPagedList(string keySearch, int status = -1, string sort = "RoleID", string order = "desc", int pageSize = 10, int offset = 0)
        {
            var results = _roleBUS.GetPagedList(keySearch, status, sort, order, pageSize, offset);
            _responseMessage = _roleBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }
    }
}
