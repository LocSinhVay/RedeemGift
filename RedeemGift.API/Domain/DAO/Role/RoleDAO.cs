using RedeemGiftAPI.Models.Role.Inputs;
using System.Data;

namespace RedeemGiftAPI.Domain.DAO.Role
{
    public interface IRoleDAO
    {
        public DataTable GetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset);

        public int Insert(InsertRoleInput bo, string userLogin, IData objData = null);

        public int Update(UpdateRoleInput bo, string userLogin, IData objData = null);

        public int Delete(DeleteRoleInput bo, string userLogin);

    }
    public class RoleDAO : IRoleDAO
    {
        private IData objData = null;
        public DataTable GetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Role_GetPagedList");
                objData.AddParameter("@PageSize", pageSize);
                objData.AddParameter("@Offset", offset);
                objData.AddParameter("@Sort", sort);
                objData.AddParameter("@Order", order);

                objData.AddParameter("@KeySearch", keySearch);
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

        public int Insert(InsertRoleInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Role_Insert");
                objData.AddParameter("@RoleName", bo.RoleName);
                objData.AddParameter("@Symbol", bo.Symbol);
                objData.AddParameter("@Status", bo.Status);

                objData.AddParameter("@UserLogin", userLogin);
                returnVal = Convert.ToInt32(objData.ExecStoreToString());
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

        public int Update(UpdateRoleInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Role_Update");
                objData.AddParameter("@RoleID", bo.RoleID);
                objData.AddParameter("@RoleName", bo.RoleName);
                objData.AddParameter("@Symbol", bo.Symbol);
                objData.AddParameter("@Status", bo.Status);

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

        public int Delete(DeleteRoleInput bo, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Role_Delete");
                objData.AddParameter("@RoleID", bo.RoleID);
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
