using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO.Dashboard;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.Dashboard.Outputs;

namespace RedeemGiftAPI.Domain.BUS.Dashboard
{
    public interface IDashboardBUS : IBaseBUS
    {
        public DashboardSummaryOutput GetDashboardSummary(string projectCode);
    }

    public class DashboardBUS : BaseBUS, IDashboardBUS
    {
        private readonly IDashboardDAO _dashboardDAO = null;

        public DashboardBUS(IHttpContextAccessor httpContextAccessor, IDashboardDAO dashboardDAO) : base(httpContextAccessor)
        {
            _dashboardDAO = dashboardDAO;
        }

        public DashboardSummaryOutput GetDashboardSummary(string projectCode)
        {
            DashboardSummaryOutput result = new DashboardSummaryOutput();
            try
            {
                var dt = _dashboardDAO.GetDashboardSummary(projectCode);
                if (dt != null && dt.Rows.Count > 0)
                {
                    result = DataTableHelper.DataTableToList<DashboardSummaryOutput>(dt).FirstOrDefault() ?? new DashboardSummaryOutput();
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                _ = LogHelper.InsertLog(
                    title: "GetDashboardSummary_DashboardBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: projectCode
                );
            }
            return result;
        }
    }
}
