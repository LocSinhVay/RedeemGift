using RedeemGiftAPI.Models.Role.Inputs;
using System.Data;

namespace RedeemGiftAPI.Domain.DAO.Role
{
    public interface IRoleMenuDAO
    {
        public DataTable GetList(int roleID);

        public int Insert(InsertRoleMenuInput bo, string userLogin, IData objData = null);

        public int Delete(DeleteRoleInput bo, string userLogin, IData objData = null);

    }
    public class RoleMenuDAO : IRoleMenuDAO
    {
        private IData objData = null;
        public DataTable GetList(int roleID)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Role_Menu_GetList");
                objData.AddParameter("@RoleID", roleID);

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

        public int Insert(InsertRoleMenuInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Role_Menu_Insert");
                objData.AddParameter("@RoleID", bo.RoleID);
                objData.AddParameter("@MenuID", bo.MenuID);
                objData.AddParameter("@IsChecked", bo.IsChecked);
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

        public int Delete(DeleteRoleInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Role_Menu_Delete");
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
                if (isConnection)
                {
                    objData.Disconnect();
                }
            }
            return returnVal;
        }
    }
}
