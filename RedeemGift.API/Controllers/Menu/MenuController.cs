using RedeemGiftAPI.Domain.BUS.Menu;
using RedeemGiftAPI.Models.Menu.Inputs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RedeemGiftAPI.Controllers.Menu
{
    [Authorize]
    [Route("api/menu/[action]")]
    public class MenuController : BaseController
    {
        private readonly IMenuBUS _menuBUS;

        public MenuController(IHttpContextAccessor httpContextAccessor, IMenuBUS menuBUS) : base(httpContextAccessor)
        {
            _menuBUS = menuBUS;
        }

        [HttpPost]
        public IActionResult Insert([FromForm] InsertMenuInput bo)
        {
            int result = _menuBUS.Insert(bo, _userLogin);
            _responseMessage = _menuBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult Delete(DeleteMenuInput bo)
        {
            int result = _menuBUS.Delete(bo, _userLogin);
            _responseMessage = _menuBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult Update([FromForm] UpdateMenuInput bo)
        {
            int result = _menuBUS.Update(bo, _userLogin);
            _responseMessage = _menuBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult MenuGetPagedList(string keySearch, int status = -1, string sort = "MenuName", string order = "desc", int pageSize = 10, int offset = 0)
        {
            var results = _menuBUS.GetPagedList(keySearch, status, sort, order, pageSize, offset);
            _responseMessage = _menuBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult GetAllMenu()
        {
            var results = _menuBUS.GetAll();
            _responseMessage = _menuBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        //[HttpGet]
        //public IActionResult GetMenuByRoleID()
        //{
        //    var results = _menuBUS.GetMenu(_roleID);
        //    _responseMessage = _menuBUS.GetResponseMessage();
        //    _responseMessage.Data = results;

        //    return Ok(_responseMessage);
        //}
    }
}
