using System.Data;

namespace RedeemGiftAPI.Domain.DAO.Dashboard
{
    public interface IDashboardDAO
    {
        public DataTable GetDashboardSummary(string projectCode);
    }

    public class DashboardDAO : IDashboardDAO
    {
        private IData objData = null;

        public DataTable GetDashboardSummary(string projectCode)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Dashboard_GetSummary");
                objData.AddParameter("@ProjectCode", projectCode);
                dt = objData.ExecStoreToDataTable();
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                objData.Disconnect();
            }
            return dt;
        }
    }
}
