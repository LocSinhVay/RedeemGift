using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.BUS.SystemUser;
using RedeemGiftAPI.Models.SystemUser.Inputs;

namespace RedeemGiftAPI.Controllers.SystemUser
{
    [Authorize]
    [Route("api/systemUser/[action]")]
    public class SystemUserController : BaseController
    {
        private readonly ISystemUserBUS _systemUserBUS;

        public SystemUserController(IHttpContextAccessor httpContextAccessor, ISystemUserBUS systemUserBUS) : base(httpContextAccessor)
        {
            _systemUserBUS = systemUserBUS;
        }

        [HttpPost]
        public async Task<IActionResult> Insert(InsertSystemUserInput bo)
        {
            int result = await _systemUserBUS.InsertAsync(bo, _userLogin);
            _responseMessage = _systemUserBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public async Task<IActionResult> Update(UpdateSystemUserInput bo)
        {
            int result = await _systemUserBUS.UpdateAsync(bo, _userLogin);
            _responseMessage = _systemUserBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult Delete(DeleteSystemUserInput bo)
        {
            int result = _systemUserBUS.Delete(bo, _userLogin);
            _responseMessage = _systemUserBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult UpdatePassword(UpdatePasswordSystemUserInput bo)
        {
            int result = _systemUserBUS.UpdatePassword(bo, _userLogin);
            _responseMessage = _systemUserBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult UserSystemGetPagedList(string keySearch, int status = -1, int roleID = -1, string projectCode = null, string sort = "Username", string order = "desc", int pageSize = 10, int offset = 0)
        {

            var results = _systemUserBUS.GetPagedList(keySearch, status, roleID, projectCode, sort, order, pageSize, offset);
            _responseMessage = _systemUserBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult GetNewUsername(string symbol)
        {
            var result = _systemUserBUS.GetNewUsername(symbol);
            _responseMessage = _systemUserBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult Export(string keySearch, string projectCode, int roleID, int status)
        {
            var results = _systemUserBUS.Export(keySearch, projectCode, roleID, status);

            if (results != null && results.Rows.Count > 0)
            {
                var file = CommonHelper.ExportFile(results, "Danh sách User System");
                return File(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "UserSystem.xlsx");
            }

            return File(new byte[0], "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "");
        }

        [HttpGet]
        public IActionResult GetAllRole()
        {
            var results = _systemUserBUS.GetAllRole();
            _responseMessage = _systemUserBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        // AccountType
        //[HttpGet]
        //public IActionResult ViewAccountTypeGetPagedList(string keySearch, int status = -1, string sort = "ID", string order = "asc", int pageSize = 5, int offset = 0)
        //{
        //    var results = _systemUserBUS.ViewAccountTypeGetPagedList(keySearch, status, sort, order, pageSize, offset);
        //    _responseMessage = _systemUserBUS.GetResponseMessage();
        //    _responseMessage.Data = results;

        //    return Ok(_responseMessage);
        //}

        //[HttpPost]
        //public IActionResult InsertAccountType([FromForm] InsertAccountTypeInput bo)
        //{
        //    int result = _systemUserBUS.InsertAccountType(bo, _userLogin);
        //    _responseMessage = _systemUserBUS.GetResponseMessage();
        //    _responseMessage.Data = result;

        //    return Ok(_responseMessage);
        //}

        //[HttpPost]
        //public IActionResult UpdateAccountType([FromForm] UpdateAccountTypeInput bo)
        //{
        //    int result = _systemUserBUS.UpdateAccountType(bo, _userLogin);
        //    _responseMessage = _systemUserBUS.GetResponseMessage();
        //    _responseMessage.Data = result;

        //    return Ok(_responseMessage);
        //}

        //[HttpPost]
        //public IActionResult UpdateAccountTypeStatus(int accountTypeID, int isActive)
        //{
        //    int result = _systemUserBUS.UpdateAccountTypeStatus(accountTypeID, isActive, _userLogin);
        //    _responseMessage = _systemUserBUS.GetResponseMessage();
        //    _responseMessage.Data = result;

        //    return Ok(_responseMessage);
        //}

        //[HttpGet]
        //public IActionResult AccountTypeGetAll()
        //{
        //    var results = _systemUserBUS.AccountTypeGetAll();
        //    _responseMessage = _systemUserBUS.GetResponseMessage();
        //    _responseMessage.Data = results;

        //    return Ok(_responseMessage);
        //}

        // SUP
        [HttpGet]
        public IActionResult SupGetList()
        {
            var results = _systemUserBUS.SupGetList();
            _responseMessage = _systemUserBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }
    }
}
