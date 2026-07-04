using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO;
using RedeemGiftAPI.Domain.DAO.EmailConfig;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.EmailConfig.Inputs;
using RedeemGiftAPI.Models.EmailConfig.Outputs;

namespace RedeemGiftAPI.Domain.BUS.EmailConfig
{
    public interface IEmailConfigBUS : IBaseBUS
    {
        public List<GetPagedListEmailConfigOutput> GetPagedList(string type, int status, string sort, string order, int pageSize, int offset);

        public List<GetAllEmailConfigOutput> GetAll();

        public int Insert(InsertEmailConfigInput bo, string userLogin);

        public int Update(UpdateEmailConfigInput bo, string userLogin);

        public int Delete(DeleteEmailConfigInput bo, string userLogin);

        public int ChooseEmailConfig(ChooseEmailConfigInput bo, string userLogin);

    }
    public class EmailConfigBUS : BaseBUS, IEmailConfigBUS
    {
        private readonly IEmailConfigDAO _emailConfigDAO = null;
        public EmailConfigBUS(IHttpContextAccessor httpContextAccessor, IEmailConfigDAO emailConfigDAO) : base(httpContextAccessor)
        {
            _emailConfigDAO = emailConfigDAO;
        }

        public List<GetPagedListEmailConfigOutput> GetPagedList(string type, int status, string sort, string order, int pageSize, int offset)
        {
            List<GetPagedListEmailConfigOutput> results = new List<GetPagedListEmailConfigOutput>();
            try
            {
                var dt = _emailConfigDAO.GetPagedList(type, status, sort, order, pageSize, offset);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetPagedListEmailConfigOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetPagedList_EmailConfigBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public List<GetAllEmailConfigOutput> GetAll()
        {
            List<GetAllEmailConfigOutput> results = new List<GetAllEmailConfigOutput>();
            try
            {
                var dt = _emailConfigDAO.GetAll();
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetAllEmailConfigOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetAll_EmailConfigBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public int Insert(InsertEmailConfigInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Insert(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _emailConfigDAO.Insert(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "Insert_EmailConfigBUS",
                        content: objEx.Message,
                        source: "RedeemGiftAPI",
                        userLogin: _userLogin,
                        parameter: bo
                    );
                    objData.RollBack();

                    returnVal = -1;
                }
                finally
                {
                    objData.Disconnect();
                }
            }
            return returnVal;
        }

        public int Update(UpdateEmailConfigInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Update(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _emailConfigDAO.Update(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "Update_EmailConfigBUS",
                        content: objEx.Message,
                        source: "RedeemGiftAPI",
                        userLogin: _userLogin,
                        parameter: bo
                    );
                    objData.RollBack();

                    returnVal = -1;
                }
                finally
                {
                    objData.Disconnect();
                }
            }
            return returnVal;
        }

        public int Delete(DeleteEmailConfigInput bo, string userLogin)
        {
            int returnVal = -1;
            try
            {
                if (IsInputValid_Delete(bo))
                {
                    returnVal = _emailConfigDAO.Delete(bo, userLogin);
                }

            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "Delete_EmailConfigBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }

        public int ChooseEmailConfig(ChooseEmailConfigInput bo, string userLogin)
        {
            int returnVal = -1;
            try
            {
                returnVal = _emailConfigDAO.ChooseEmailConfig(bo, userLogin);
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "ChooseEmailConfig_EmailConfigBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }

        private bool IsInputValid_Insert(InsertEmailConfigInput bo)
        {
            if (string.IsNullOrEmpty(bo.SenderEmail))
            {
                _responseMessage.Message = "Vui lòng nhập Email Config";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.Type == "GMAIL")
            {
                if (string.IsNullOrEmpty(bo.ClientId))
                {
                    _responseMessage.Message = "Vui lòng nhập Client ID";
                    _responseMessage.Status = MessageStatus.Warning;
                    return false;
                }

                if (string.IsNullOrEmpty(bo.ClientSecret))
                {
                    _responseMessage.Message = "Vui lòng nhập Client Secret";
                    _responseMessage.Status = MessageStatus.Warning;
                    return false;
                }

                if (string.IsNullOrEmpty(bo.RedirectUri))
                {
                    _responseMessage.Message = "Vui lòng nhập Redirect Uri";
                    _responseMessage.Status = MessageStatus.Warning;
                    return false;
                }
            }

            if (bo.Type == "SMTP")
            {
                if (string.IsNullOrEmpty(bo.SenderPassword))
                {
                    _responseMessage.Message = "Vui lòng nhập Email Password";
                    _responseMessage.Status = MessageStatus.Warning;
                    return false;
                }
            }

            return true;
        }

        private bool IsInputValid_Update(UpdateEmailConfigInput bo)
        {
            if (bo.EmailId <= 0)
            {
                _responseMessage.Message = "Không tìm thấy Email Config này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.SenderEmail))
            {
                _responseMessage.Message = "Vui lòng nhập Email Config";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.Type == "GMAIL")
            {
                if (string.IsNullOrEmpty(bo.ClientId))
                {
                    _responseMessage.Message = "Vui lòng nhập Client ID";
                    _responseMessage.Status = MessageStatus.Warning;
                    return false;
                }

                if (string.IsNullOrEmpty(bo.ClientSecret))
                {
                    _responseMessage.Message = "Vui lòng nhập Client Secret";
                    _responseMessage.Status = MessageStatus.Warning;
                    return false;
                }

                if (string.IsNullOrEmpty(bo.RedirectUri))
                {
                    _responseMessage.Message = "Vui lòng nhập Redirect Uri";
                    _responseMessage.Status = MessageStatus.Warning;
                    return false;
                }
            }

            if (bo.Type == "SMTP")
            {
                if (string.IsNullOrEmpty(bo.SenderPassword))
                {
                    _responseMessage.Message = "Vui lòng nhập Email Password";
                    _responseMessage.Status = MessageStatus.Warning;
                    return false;
                }
            }

            return true;
        }

        private bool IsInputValid_Delete(DeleteEmailConfigInput bo)
        {
            if (bo.EmailId <= 0)
            {
                _responseMessage.Message = "Không tìm thấy Email Config này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }
    }
}
