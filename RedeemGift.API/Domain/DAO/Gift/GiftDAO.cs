using RedeemGiftAPI.Models.Gift.Inputs;
using System.Data;

namespace RedeemGiftAPI.Domain.DAO.Gift
{
    public interface IGiftDAO
    {
        public DataTable GiftGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset);
        public int UpdateGiftStatus(int id, int status, string userLogin, IData objData = null);
        public int InsertGift(InsertGiftInput bo, string userLogin, IData objData = null);
        public int UpdateGift(UpdateGiftInput bo, string userLogin, IData objData = null);
    }
    public class GiftDAO : IGiftDAO
    {
        private IData objData = null;

        public DataTable GiftGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Gift_GetPagedList");
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

        public int UpdateGiftStatus(int id, int status, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Gift_Status_Update");
                objData.AddParameter("@GiftID", id);
                objData.AddParameter("@Status", status);
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

        public int InsertGift(InsertGiftInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Gift_Insert");
                objData.AddParameter("@ProjectCode", bo.ProjectCode);
                objData.AddParameter("@GiftName", bo.GiftName);
                objData.AddParameter("@Quantity", bo.Quantity);
                objData.AddParameter("@IsUnlimited", bo.IsUnlimited);
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

        public int UpdateGift(UpdateGiftInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Gift_Update");
                objData.AddParameter("@GiftID", bo.GiftID);
                objData.AddParameter("@ProjectCode", bo.ProjectCode);
                objData.AddParameter("@GiftName", bo.GiftName);
                objData.AddParameter("@Quantity", bo.Quantity);
                objData.AddParameter("@IsUnlimited", bo.IsUnlimited);
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
    }
}
