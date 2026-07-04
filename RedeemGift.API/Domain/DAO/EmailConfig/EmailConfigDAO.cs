using RedeemGiftAPI.Models.EmailConfig.Inputs;
using System.Data;

namespace RedeemGiftAPI.Domain.DAO.EmailConfig
{
    public interface IEmailConfigDAO
    {
        public DataTable GetPagedList(string type, int status, string sort, string order, int pageSize, int offset);

        public DataTable GetAll();

        public int Insert(InsertEmailConfigInput bo, string userLogin, IData objData = null);

        public int Update(UpdateEmailConfigInput bo, string userLogin, IData objData = null);

        public int Delete(DeleteEmailConfigInput bo, string userLogin);

        public int ChooseEmailConfig(ChooseEmailConfigInput bo, string userLogin);

    }
    public class EmailConfigDAO : IEmailConfigDAO
    {
        private IData objData = null;
        public DataTable GetPagedList(string type, int status, string sort, string order, int pageSize, int offset)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_EmailConfig_GetPagedList");
                objData.AddParameter("@PageSize", pageSize);

                objData.AddParameter("@Offset", offset);
                objData.AddParameter("@Sort", sort);
                objData.AddParameter("@Order", order);

                objData.AddParameter("@Type", type);
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
                objData.CreateNewStoredProcedure("PPL_EmailConfig_GetAll");
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

        public int Insert(InsertEmailConfigInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_EmailConfig_Insert");
                objData.AddParameter("@Type", bo.Type);
                objData.AddParameter("@SmtpServer", bo.SmtpServer);
                objData.AddParameter("@SmtpPort", bo.SmtpPort);
                objData.AddParameter("@SenderEmail", bo.SenderEmail);
                objData.AddParameter("@SenderPassword", bo.SenderPassword);
                objData.AddParameter("@ClientId", bo.ClientId);
                objData.AddParameter("@ClientSecret", bo.ClientSecret);
                objData.AddParameter("@RedirectUri", bo.RedirectUri);
                objData.AddParameter("@Token", bo.Token);
                objData.AddParameter("@RefreshToken", bo.RefreshToken);
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

        public int Update(UpdateEmailConfigInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_EmailConfig_Update");
                objData.AddParameter("@EmailId", bo.EmailId);
                objData.AddParameter("@SenderEmail", bo.SenderEmail);
                objData.AddParameter("@SenderPassword", bo.SenderPassword);
                objData.AddParameter("@ClientId", bo.ClientId);
                objData.AddParameter("@ClientSecret", bo.ClientSecret);
                objData.AddParameter("@RedirectUri", bo.RedirectUri);
                objData.AddParameter("@Token", bo.Token);
                objData.AddParameter("@RefreshToken", bo.RefreshToken);
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

        public int Delete(DeleteEmailConfigInput bo, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_EmailConfig_Delete");
                objData.AddParameter("@EmailId", bo.EmailId);
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

        public int ChooseEmailConfig(ChooseEmailConfigInput bo, string userLogin)
        {
            int returnVal = -1;
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_ChooseEmailConfig");
                objData.AddParameter("@EmailId", bo.EmailId);
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
