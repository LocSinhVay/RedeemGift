using RedeemGiftAPI.Models.Common.Outputs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RedeemGiftAPI.Controllers
{
    [Authorize]
    [ApiController]
    public class BaseController : Controller
    {

        public ResponseMessage _responseMessage = new ResponseMessage();
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BaseController(IHttpContextAccessor httpContextAccessor)
        {
            _responseMessage.Message = string.Empty;
            _responseMessage.Status = MessageStatus.Success;
            _httpContextAccessor = httpContextAccessor;
        }

        private string GetUserLogin()
        {
            return _httpContextAccessor.HttpContext.Request.Headers["Username"].ToString();
        }

        private string GetProjectID()
        {
            return _httpContextAccessor.HttpContext.Request.Headers["ProjectID"].ToString();
        }

        //private string GetRoleName()
        //{
        //    return _httpContextAccessor.HttpContext.Request.Headers["_roleName"].ToString();
        //}

        private string GetRoleID()
        {
            return _httpContextAccessor.HttpContext.Request.Headers["RoleID"].ToString();
        }

        protected string _userLogin => GetUserLogin();

        protected string _projectID => GetProjectID();

        //protected string _roleName => GetRoleName();

        protected string _roleID => GetRoleID();

    }
}
