using RedeemGiftAPI.Models.Menu.Inputs;
using System.Data;

namespace RedeemGiftAPI.Domain.DAO.Menu
{
    public interface IMenuDAO
    {
        public DataTable GetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset);

        public DataTable GetAll();

        public DataTable GetMenu(int roleID);

        public int Insert(InsertMenuInput bo, string userLogin, IData objData = null);

        public int Update(UpdateMenuInput bo, string userLogin, IData objData = null);

        public int Delete(DeleteMenuInput bo, string userLogin);

    }
    public class MenuDAO : IMenuDAO
    {
        private IData objData = null;
        public DataTable GetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Menu_GetPagedList");
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

        public DataTable GetAll()
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Menu_GetAll");
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

        public DataTable GetMenu(int roleID)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_System_Menu_GetList");
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

        public int Insert(InsertMenuInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Menu_Insert");
                objData.AddParameter("@MenuName", bo.MenuName);
                objData.AddParameter("@MenuPath", bo.MenuPath);
                objData.AddParameter("@Icon", bo.Icon);
                objData.AddParameter("@ParentId", bo.ParentId);
                objData.AddParameter("@Status", bo.Status);
                objData.AddParameter("@DisplayOrder", bo.DisplayOrder);

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

        public int Update(UpdateMenuInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Menu_Update");
                objData.AddParameter("@MenuID", bo.MenuID);
                objData.AddParameter("@MenuName", bo.MenuName);
                objData.AddParameter("@MenuPath", bo.MenuPath);
                objData.AddParameter("@Icon", bo.Icon);
                objData.AddParameter("@ParentId", bo.ParentId);
                objData.AddParameter("@Status", bo.Status);
                objData.AddParameter("@DisplayOrder", bo.DisplayOrder);

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

        public int Delete(DeleteMenuInput bo, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Menu_Delete");
                objData.AddParameter("@MenuID", bo.MenuID);

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
