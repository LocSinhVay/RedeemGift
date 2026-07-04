using RedeemGiftAPI.Models.Prize.Inputs;
using System.Data;

namespace RedeemGiftAPI.Domain.DAO.Prize
{
    public interface IPrizeDAO
    {
        public DataTable PrizeGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset);
        public DataTable GetPrizesByProject(string projectCode);
        public int InsertPrize(InsertPrizeInput bo, string userLogin, IData objData = null);
        public int UpdatePrize(UpdatePrizeInput bo, string userLogin, IData objData = null);
        public int DeletePrize(DeletePrizeInput bo, string userLogin);
    }
    public class PrizeDAO : IPrizeDAO
    {
        private IData objData = null;
        public DataTable PrizeGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Prize_GetPagedList");
                objData.AddParameter("@PageSize", pageSize);
                objData.AddParameter("@Offset", offset);
                objData.AddParameter("@Sort", sort);
                objData.AddParameter("@Order", order);
                objData.AddParameter("@KeySearch", keySearch);
                objData.AddParameter("@Status", status);
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
        public DataTable GetPrizesByProject(string projectCode)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_PrizesByProject_GetList");
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

        public int InsertPrize(InsertPrizeInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Prize_Insert");
                objData.AddParameter("@ProjectCode", bo.ProjectCode);
                objData.AddParameter("@GiftID", bo.GiftID);
                objData.AddParameter("@Weight", bo.Weight);
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

        public int UpdatePrize(UpdatePrizeInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Prize_Update");
                objData.AddParameter("@PrizeID", bo.PrizeID);
                objData.AddParameter("@ProjectCode", bo.ProjectCode);
                objData.AddParameter("@GiftID", bo.GiftID);
                objData.AddParameter("@Weight", bo.Weight);
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

        public int DeletePrize(DeletePrizeInput bo, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Prize_Delete");
                objData.AddParameter("@PrizeID", bo.PrizeID);
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
