using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RedeemGiftAPI.Domain.BUS.Project;
using RedeemGiftAPI.Models.Project.Inputs;

namespace RedeemGiftAPI.Controllers.Project
{
    [Authorize]
    [Route("api/project/[action]")]
    public class ProjectController : BaseController
    {
        private readonly IProjectBUS _projectBUS;

        public ProjectController(IHttpContextAccessor httpContextAccessor, IProjectBUS projectBUS) : base(httpContextAccessor)
        {
            _projectBUS = projectBUS;
        }

        [HttpGet]
        public IActionResult ProjectGetPagedList(string keySearch, int status = -1, string sort = "ProjectID", string order = "desc", int pageSize = 10, int offset = 0)
        {
            var results = _projectBUS.ProjectGetPagedList(keySearch, status, sort, order, pageSize, offset);
            _responseMessage = _projectBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult UpdateProjectStatus(int id, int status)
        {
            int result = _projectBUS.UpdateProjectStatus(id, status, _userLogin);
            _responseMessage = _projectBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult InsertProject([FromForm] InsertProjectInput bo)
        {
            int result = _projectBUS.InsertProject(bo, _userLogin);
            _responseMessage = _projectBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpPost]
        public IActionResult UpdateProject([FromForm] UpdateProjectInput bo)
        {
            int result = _projectBUS.UpdateProject(bo, _userLogin);
            _responseMessage = _projectBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }

        [HttpGet]
        public IActionResult GetAllProject()
        {
            var results = _projectBUS.GetAllProject();
            _responseMessage = _projectBUS.GetResponseMessage();
            _responseMessage.Data = results;

            return Ok(_responseMessage);
        }
    }
}
