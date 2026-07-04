using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RedeemGiftAPI.Domain.BUS.Dashboard;

namespace RedeemGiftAPI.Controllers.Dashboard
{
    [Authorize]
    [Route("api/dashboard/[action]")]
    public class DashboardController : BaseController
    {
        private readonly IDashboardBUS _dashboardBUS;

        public DashboardController(IHttpContextAccessor httpContextAccessor, IDashboardBUS dashboardBUS) : base(httpContextAccessor)
        {
            _dashboardBUS = dashboardBUS;
        }

        [HttpGet]
        public IActionResult GetDashboardSummary(string projectCode)
        {
            var result = _dashboardBUS.GetDashboardSummary(projectCode);
            _responseMessage = _dashboardBUS.GetResponseMessage();
            _responseMessage.Data = result;

            return Ok(_responseMessage);
        }
    }
}
