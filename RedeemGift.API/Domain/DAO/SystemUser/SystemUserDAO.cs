using RedeemGiftAPI.Models.SystemUser.Inputs;
using System.Data;

namespace RedeemGiftAPI.Domain.DAO.SystemUser
{
    public interface ISystemUserDAO
    {
        public DataTable GetPagedList(string keySearch, int status, int roleID, string projectCode, string sort, string order, int pageSize, int offset);
        //public DataTable GetList(int projectID);
        public string GetNewUsername(string symbol);
        public DataTable GetAllRole();
        public DataTable Export(string keySearch, string projectCode, int roleID, int status);
        public DataTable Login(string username);
        public DataTable GetUserFromEmail(SendRequestResetInput bo);
        public DataTable GetUserInfoFromLogin(string userLogin);
        public DataTable GetTokenEmail(int userId);

        public DataTable GetEmailConfig();

        public string GetPasswordByUsername(string Username);

        public int SaveEmailLog(int configId, int userId, string username, string fromEmail, string toEmail, string subject, string status, string errorMessage, string token);

        public int Insert(InsertSystemUserInput bo, string userLogin);

        public int Update(UpdateSystemUserInput bo, string userLogin);

        public int Delete(DeleteSystemUserInput bo, string userLogin);

        public int ResetPassword(int userId, string password, string userLogin);

        public int MarkTokenAsUsed(int id);

        public int UpdatePassword(UpdatePasswordSystemUserInput bo, string userLogin);

        //// AccountType
        //public DataTable ViewAccountTypeGetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset);
        //public int InsertAccountType(InsertAccountTypeInput bo, string userLogin, IData objData = null);
        //public int UpdateAccountType(UpdateAccountTypeInput bo, string userLogin, IData objData = null);
        //public int UpdateAccountTypeStatus(int accountTypeID, int isActive, string userLogin, IData objData = null);
        //public DataTable AccountTypeGetAll();
        public DataTable SupGetList();
    }
    public class SystemUserDAO : ISystemUserDAO
    {
        private IData objData = null;
        public DataTable GetPagedList(string keySearch, int status, int roleID, string projectCode, string sort, string order, int pageSize, int offset)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_System_User_GetPagedList");
                objData.AddParameter("@PageSize", pageSize);

                objData.AddParameter("@Offset", offset);
                objData.AddParameter("@Sort", sort);
                objData.AddParameter("@Order", order);

                objData.AddParameter("@KeySearch", keySearch);
                objData.AddParameter("@Status", status);
                objData.AddParameter("@RoleID", roleID);
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

        public string GetNewUsername(string symbol)
        {
            var dt = string.Empty;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_GetNewUsername");
                objData.AddParameter("@Symbol", symbol);

                dt = objData.ExecStoreToString();
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

        public DataTable GetAllRole()
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_System_User_GetAllRole");
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

        public DataTable Export(string keySearch, string projectCode, int roleID, int status)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_System_User_Export");
                objData.AddParameter("@KeySearch", keySearch);
                objData.AddParameter("@Status", status);
                objData.AddParameter("@RoleID", roleID);
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

        public int SaveEmailLog(int configId, int userId, string username, string fromEmail, string toEmail, string subject, string status, string errorMessage, string token)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_SaveEmailLog");

                objData.AddParameter("@ConfigId", configId);
                objData.AddParameter("@UserId", userId);
                objData.AddParameter("@Username", username);
                objData.AddParameter("@FromEmail", fromEmail);
                objData.AddParameter("@ToEmail", toEmail);
                objData.AddParameter("@Subject", subject);
                objData.AddParameter("@Status", status);
                objData.AddParameter("@ErrorMessage", errorMessage);
                objData.AddParameter("@Token", token);

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

        public int Insert(InsertSystemUserInput bo, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_System_User_Insert");

                objData.AddParameter("@ProjectCodes", bo.ProjectCodes);
                objData.AddParameter("@FullName", bo.FullName);
                objData.AddParameter("@UserLogin", userLogin);
                objData.AddParameter("@UserAvatar", bo.UserAvatar);
                objData.AddParameter("@RoleID", bo.RoleID);
                objData.AddParameter("@Phone", bo.Phone);
                objData.AddParameter("@Email", bo.Email);
                objData.AddParameter("@Password", bo.Password);
                objData.AddParameter("@Username", bo.Username);
                objData.AddParameter("@Status", bo.Status);

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

        public int Update(UpdateSystemUserInput bo, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_System_User_Update");
                objData.AddParameter("@Username", bo.Username);
                objData.AddParameter("@ProjectCodes", bo.ProjectCodes);
                objData.AddParameter("@FullName", bo.FullName);
                objData.AddParameter("@UserLogin", userLogin);
                objData.AddParameter("@UserAvatar", bo.UserAvatar);
                objData.AddParameter("@RoleID", bo.RoleID);
                objData.AddParameter("@Phone", bo.Phone);
                objData.AddParameter("@Email", bo.Email);
                objData.AddParameter("@Status", bo.Status);
                objData.AddParameter("@UserID", bo.UserID);

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

        public DataTable Login(string username)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_System_User_Login");
                objData.AddParameter("@Username", username);

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

        public DataTable GetUserFromEmail(SendRequestResetInput bo)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_GetUserFromEmail");
                objData.AddParameter("@Email", bo.Email);

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

        public DataTable GetUserInfoFromLogin(string userLogin)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_GetUserInfoFromLogin");
                objData.AddParameter("@UserLogin", userLogin);

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

        public DataTable GetTokenEmail(int userId)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_GetTokenEmail");
                objData.AddParameter("@UserId", userId);

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

        public DataTable GetEmailConfig()
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_GetEmailConfig");

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


        public string GetPasswordByUsername(string Username)
        {
            var dt = string.Empty;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_GetPassword_By_Username");
                objData.AddParameter("@Username", Username);
                dt = objData.ExecStoreToString();
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

        public int MarkTokenAsUsed(int id)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_MarkTokenAsUsed");
                objData.AddParameter("@Id", id);

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

        public int ResetPassword(int userId, string password, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_System_User_Update_Password");
                objData.AddParameter("@Password", password);
                objData.AddParameter("@UserLogin", userLogin);
                objData.AddParameter("@UserID", userId);

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
        public int UpdatePassword(UpdatePasswordSystemUserInput bo, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_System_User_Update_Password");
                objData.AddParameter("@Password", bo.Password);
                objData.AddParameter("@UserLogin", userLogin);
                objData.AddParameter("@UserID", bo.UserID);

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

        public int Delete(DeleteSystemUserInput bo, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_System_User_Delete");
                objData.AddParameter("@UserID", bo.UserID);
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

        public DataTable SupGetList()
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_SUP_GetList");
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
