using RedeemGiftAPI.Models.RedeemSpin.Inputs;
using System.Data;

namespace RedeemGiftAPI.Domain.DAO.RedeemSpin
{
    public interface IRedeemSpinDAO
    {
        public DataTable RedeemSpinGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset);
        public DataTable RedemptionRuleByProjectGetList(string projectCode);
        public int InsertRedeemSpin(InsertRedeemSpinInput bo, string userLogin, IData objData = null);
        public int UpdateRedeemSpin(UpdateRedeemSpinInput bo, string userLogin, IData objData = null);
        public int DeleteRedeemSpin(DeleteRedeemSpinInput bo, string userLogin);

    }
    public class RedeemSpinDAO : IRedeemSpinDAO
    {
        private IData objData = null;
        public DataTable RedeemSpinGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_RedeemSpin_GetPagedList");
                objData.AddParameter("@PageSize", pageSize);

                objData.AddParameter("@Offset", offset);
                objData.AddParameter("@Sort", sort);
                objData.AddParameter("@Order", order);

                objData.AddParameter("@KeySearch", keySearch);
                objData.AddParameter("@ProjectCode", projectCode);
                objData.AddParameter("@Status", status);

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

        public DataTable RedemptionRuleByProjectGetList(string projectCode)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_RedemptionRuleByProject_GetList");
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

        public int InsertRedeemSpin(InsertRedeemSpinInput bo, string userLogin, IData objData = null)
        {
            bool isConnection = false;
            int returnVal = -1;
            try
            {
                if (objData == null || !objData.IsConnected())
                {
                    objData = Data.CreateData();
                    objData.Connect();
                    isConnection = true;
                }

                objData.CreateNewStoredProcedure("PPL_RedeemSpin_Insert");
                objData.AddParameter("@ProjectCode", bo.ProjectCode);
                objData.AddParameter("@BillValuePerSpin", bo.BillValuePerSpin);
                objData.AddParameter("@MaxSpinsPerBill", bo.MaxSpinsPerBill);
                objData.AddParameter("@StartDate", bo.StartDate);
                objData.AddParameter("@EndDate", bo.EndDate);
                objData.AddParameter("@UserLogin", userLogin);
                objData.ExecNonQuery();
                returnVal = 1;
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                if (isConnection)
                {
                    objData.Disconnect();
                }
            }
            return returnVal;
        }

        public int UpdateRedeemSpin(UpdateRedeemSpinInput bo, string userLogin, IData objData = null)
        {
            bool isConnection = false;
            int returnVal = -1;
            try
            {
                if (objData == null || !objData.IsConnected())
                {
                    objData = Data.CreateData();
                    objData.Connect();
                    isConnection = true;
                }

                objData.CreateNewStoredProcedure("PPL_RedeemSpin_Update");
                objData.AddParameter("@RuleID", bo.RuleID);
                objData.AddParameter("@ProjectCode", bo.ProjectCode);
                objData.AddParameter("@BillValuePerSpin", bo.BillValuePerSpin);
                objData.AddParameter("@MaxSpinsPerBill", bo.MaxSpinsPerBill);
                objData.AddParameter("@StartDate", bo.StartDate);
                objData.AddParameter("@EndDate", bo.EndDate);
                objData.AddParameter("@UserLogin", userLogin);

                objData.ExecNonQuery();
                returnVal = 1;
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                if (isConnection)
                {
                    objData.Disconnect();
                }
            }
            return returnVal;
        }

        public int DeleteRedeemSpin(DeleteRedeemSpinInput bo, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_RedeemSpin_Delete");
                objData.AddParameter("@RuleID", bo.RuleID);
                objData.AddParameter("@UserLogin", userLogin);
                objData.ExecNonQuery();
                returnVal = 1;
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                objData.Disconnect();
            }
            return returnVal;
        }
    }
}
