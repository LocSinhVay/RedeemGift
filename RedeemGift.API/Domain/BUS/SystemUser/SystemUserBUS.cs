using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO.SystemUser;
using RedeemGiftAPI.Models.AccountType.Inputs;
using RedeemGiftAPI.Models.AccountType.Outputs;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.SystemUser.Inputs;
using RedeemGiftAPI.Models.SystemUser.Outputs;
using System.Data;

namespace RedeemGiftAPI.Domain.BUS.SystemUser
{
    public interface ISystemUserBUS : IBaseBUS
    {
        public List<GetPagedListSystemUserOutput> GetPagedList(string keySearch, int status, int roleID, string projectCode, string sort, string order, int pageSize, int offset);
        public List<GetAllRoleOutput> GetAllRole();
        public string GetNewUsername(string symbol);
        public LoginSystemUserOutput Login(LoginSystemUserInput bo);
        public UserInfoFromEmail GetUserFromEmail(SendRequestResetInput bo);
        public UserInfoFromEmail GetUserInfoFromLogin(string userLogin);
        public TokenEmailInfo GetTokenEmail(int userId);
        public EmailConfiguration GetEmailConfig();
        public DataTable Export(string keySearch, string projectCode, int roleID, int status);
        public int SaveEmailLog(int configId, int userId, string username, string fromEmail, string toEmail, string subject, string status, string errorMessage, string token);
        public Task<int> InsertAsync(InsertSystemUserInput bo, string userLogin);
        public Task<int> UpdateAsync(UpdateSystemUserInput bo, string userLogin);
        public int Delete(DeleteSystemUserInput bo, string userLogin);
        public int UpdatePassword(UpdatePasswordSystemUserInput bo, string userLogin);
        public int ResetPassword(int userId, string password, string userLogin);
        public int MarkTokenAsUsed(int id);

        //// AccountType
        //public List<GetPagedListAccountTypeOutput> ViewAccountTypeGetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset);
        //public int InsertAccountType(InsertAccountTypeInput bo, string userLogin);
        //public int UpdateAccountType(UpdateAccountTypeInput bo, string userLogin);
        //public int UpdateAccountTypeStatus(int accountTypeID, int isActive, string userLogin);
        //public List<GetAllAccountTypeOutput> AccountTypeGetAll();
        public List<GetListSupOutput> SupGetList();
    }
    public class SystemUserBUS : BaseBUS, ISystemUserBUS
    {
        private readonly string DEFAULT_PASSWORD = "123456";
        private readonly ISystemUserDAO _systemUserDAO = null;
        private readonly IUploadFileHelper _uploadFileHelper = null;
        private readonly string attachDir = "SystemUser";
        public SystemUserBUS(IHttpContextAccessor httpContextAccessor, ISystemUserDAO systemUserDAO, IUploadFileHelper uploadFileHelper) : base(httpContextAccessor)
        {
            _systemUserDAO = systemUserDAO;
            _uploadFileHelper = uploadFileHelper;
        }

        public List<GetPagedListSystemUserOutput> GetPagedList(string keySearch, int status, int roleID, string projectCode, string sort, string order, int pageSize, int offset)
        {
            List<GetPagedListSystemUserOutput> results = new List<GetPagedListSystemUserOutput>();
            try
            {
                var dt = _systemUserDAO.GetPagedList(keySearch, status, roleID, projectCode, sort, order, pageSize, offset);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetPagedListSystemUserOutput>(dt);
                    foreach (var item in results)
                    {
                        item.UserAvatar = string.IsNullOrEmpty(item.UserAvatar) ? item.UserAvatar = "SystemUser/blank.png" : item.UserAvatar;
                        item.AvatarImage = _baseURL + FOLDER_FILE + item.UserAvatar;
                    }
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetPagedList_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public string GetNewUsername(string symbol)
        {
            string result = null;
            try
            {
                var dt = _systemUserDAO.GetNewUsername(symbol);
                if (dt != null)
                {
                    result = dt;
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetNewUsername_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: result
                );
            }
            return result;
        }

        public List<GetAllRoleOutput> GetAllRole()
        {
            List<GetAllRoleOutput> results = new List<GetAllRoleOutput>();
            try
            {
                var dt = _systemUserDAO.GetAllRole();
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetAllRoleOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetAllRole_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public DataTable Export(string keySearch, string projectCode, int roleID, int status)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = _systemUserDAO.Export(keySearch, projectCode, roleID, status);
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "Export_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: dt
                );
            }
            return dt;
        }

        public int SaveEmailLog(int configId, int userId, string username, string fromEmail, string toEmail, string subject, string status, string errorMessage, string token)
        {
            int returnVal = -1;
            try
            {
                returnVal = _systemUserDAO.SaveEmailLog(configId, userId, username, fromEmail, toEmail, subject, status, errorMessage, token);
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "SaveEmailLog_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: new
                    {
                        ConfigId = configId,
                        UserId = userId,
                        FromEmail = fromEmail,
                        ToEmail = toEmail,
                        Subject = subject,
                        Status = status,
                        ErrorMessage = errorMessage,
                        Token = token
                    }
                );
            }
            return returnVal;
        }

        public async Task<int> InsertAsync(InsertSystemUserInput bo, string userLogin)
        {
            int returnVal = -1;
            try
            {
                if (IsInputValid_Insert(bo))
                {
                    if (bo.File != null && bo.File.Length > 0)
                    {
                        // Upload file bất đồng bộ và gán đường dẫn
                        bo.UserAvatar = await _uploadFileHelper.UploadFileAsync(bo.File, attachDir);
                    }
                    else
                    {
                        bo.UserAvatar = "SystemUser/blank.png"; // Avatar mặc định
                    }

                    // Hash password
                    bo.Password = BCrypt.Net.BCrypt.HashPassword(DEFAULT_PASSWORD);

                    // Insert vào DB
                    returnVal = _systemUserDAO.Insert(bo, userLogin);

                    if (returnVal == -1)
                    {
                        _responseMessage.Status = MessageStatus.Warning;
                        _responseMessage.Message = "Đã tồn tại mã nhân viên này trong hệ thống";
                    }
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Log lỗi
                _ = LogHelper.InsertLog(
                    title: "Insert_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }

            return returnVal;
        }



        public async Task<int> UpdateAsync(UpdateSystemUserInput bo, string userLogin)
        {
            int returnVal = -1;
            try
            {
                if (IsInputValid_Update(bo))
                {
                    if (bo.File != null && bo.File.Length > 0)
                    {
                        // Upload file bất đồng bộ và gán đường dẫn
                        string timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
                        string newFileName = Path.GetFileNameWithoutExtension(bo.File.FileName)
                                             + "_" + timestamp
                                             + Path.GetExtension(bo.File.FileName);

                        bo.UserAvatar = await _uploadFileHelper.UploadFileAsync(bo.File, attachDir, newFileName);
                    }
                    else
                    {
                        bo.UserAvatar = "SystemUser/blank.png"; // Avatar mặc định
                    }

                    returnVal = _systemUserDAO.Update(bo, userLogin);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "Update_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }

        public LoginSystemUserOutput Login(LoginSystemUserInput bo)
        {
            LoginSystemUserOutput result = null;
            try
            {
                if (IsInputValid_Login(bo))
                {
                    //bo.Password = BCrypt.Net.BCrypt.HashPassword(bo.Password);
                    DataTable dt = _systemUserDAO.Login(bo.Username);
                    if (dt != null && dt.Rows.Count > 0)
                    {
                        result = DataTableHelper.DataTableToObject<LoginSystemUserOutput>(dt);
                        result.AvatarImage = _baseURL + FOLDER_FILE + result.UserAvatar;
                        if (!result.StatusUser)
                        {
                            _responseMessage.Status = MessageStatus.Warning;
                            _responseMessage.Message = "Tài khoản này đã bị khóa. Vui lòng liên hệ Admin System.";
                        }

                        if (!result.StatusRole)
                        {
                            _responseMessage.Status = MessageStatus.Warning;
                            _responseMessage.Message = "Phân quyền của tài khoản đã bị khóa. Vui lòng liên hệ Admin System.";
                        }

                        if (!BCrypt.Net.BCrypt.Verify(bo.Password, result.Password))
                        {
                            _responseMessage.Status = MessageStatus.Warning;
                            _responseMessage.Message = "Tài khoản mật khẩu không trùng khớp!!!";
                        }
                    }
                    else
                    {
                        _responseMessage.Status = MessageStatus.Warning;
                        _responseMessage.Message = "Tài khoản này không tồn tồn tại hoặc đã bị xóa. Vui lòng liên hệ System Admin.";
                    }
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "Login_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return result;
        }

        public TokenEmailInfo GetTokenEmail(int userId)
        {
            TokenEmailInfo result = null;
            try
            {
                DataTable dt = _systemUserDAO.GetTokenEmail(userId);
                if (dt != null && dt.Rows.Count > 0)
                {
                    result = DataTableHelper.DataTableToObject<TokenEmailInfo>(dt);
                }
                else
                {
                    _responseMessage.Status = MessageStatus.Warning;
                    _responseMessage.Message = "Không tìm thấy thông tin TokenMail theo UserId trong hệ thống";
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetTokenEmail_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: userId
                );
            }
            return result;
        }
        public UserInfoFromEmail GetUserFromEmail(SendRequestResetInput bo)
        {
            UserInfoFromEmail result = null;
            try
            {

                if (!string.IsNullOrEmpty(bo.Email) && !CommonHelper.IsValidEmail(bo.Email))
                {
                    _responseMessage.Message = "Định dạng email không hợp lệ";
                    _responseMessage.Status = MessageStatus.Warning;
                }
                else
                {
                    DataTable dt = _systemUserDAO.GetUserFromEmail(bo);
                    if (dt != null && dt.Rows.Count > 0)
                    {
                        result = DataTableHelper.DataTableToObject<UserInfoFromEmail>(dt);
                    }
                    else
                    {
                        _responseMessage.Status = MessageStatus.Warning;
                        _responseMessage.Message = "Không tìm thấy email này trong hệ thống";
                    }
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetUserFromEmail_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return result;
        }

        public UserInfoFromEmail GetUserInfoFromLogin(string userLogin)
        {
            UserInfoFromEmail result = null;
            try
            {

                if (string.IsNullOrEmpty(userLogin))
                {
                    _responseMessage.Message = "Định dạng UserLogin không hợp lệ";
                    _responseMessage.Status = MessageStatus.Warning;
                }
                else
                {
                    DataTable dt = _systemUserDAO.GetUserInfoFromLogin(userLogin);
                    if (dt != null && dt.Rows.Count > 0)
                    {
                        result = DataTableHelper.DataTableToObject<UserInfoFromEmail>(dt);
                    }
                    else
                    {
                        _responseMessage.Status = MessageStatus.Warning;
                        _responseMessage.Message = "Không tìm thấy thông tin UserLogin này trong hệ thống";
                    }
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetUserInfoFromLogin_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: userLogin
                );
            }
            return result;
        }

        public EmailConfiguration GetEmailConfig()
        {
            EmailConfiguration result = null;
            try
            {
                DataTable dt = _systemUserDAO.GetEmailConfig();
                if (dt != null && dt.Rows.Count > 0)
                {
                    result = DataTableHelper.DataTableToObject<EmailConfiguration>(dt);
                }
                else
                {
                    _responseMessage.Status = MessageStatus.Warning;
                    _responseMessage.Message = "Không tìm thấy cấu hình Email.";
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetEmailConfig_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: ""
                );
            }
            return result;
        }

        public int MarkTokenAsUsed(int id)
        {
            int returnVal = -1;
            try
            {
                returnVal = _systemUserDAO.MarkTokenAsUsed(id);
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "MarkTokenAsUsed_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: id
                );
            }
            return returnVal;
        }
        public int ResetPassword(int userId, string password, string userLogin)
        {
            int returnVal = -1;
            try
            {
                //password = HashHelper.ToSHA256(password);
                password = BCrypt.Net.BCrypt.HashPassword(password);
                returnVal = _systemUserDAO.ResetPassword(userId, password, userLogin);
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "ResetPassword_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: new
                    {
                        UserID = userId,
                        Password = password,
                        UserLogin = userLogin
                    }
                );
            }
            return returnVal;
        }
        public int UpdatePassword(UpdatePasswordSystemUserInput bo, string userLogin)
        {
            int returnVal = -1;
            try
            {
                if (IsInputValid_UpdatePassword(bo, userLogin))
                {
                    if (bo.IsReset)
                    {
                        bo.Password = BCrypt.Net.BCrypt.HashPassword(DEFAULT_PASSWORD);
                        //bo.Password = HashHelper.ToSHA256(DEFAULT_PASSWORD);
                    }
                    else
                    {
                        bo.Password = BCrypt.Net.BCrypt.HashPassword(bo.NewPassword);
                        //bo.Password = HashHelper.ToSHA256(bo.NewPassword);
                    }
                    returnVal = _systemUserDAO.UpdatePassword(bo, userLogin);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "UpdatePassword_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }

        public int Delete(DeleteSystemUserInput bo, string userLogin)
        {
            int returnVal = -1;
            try
            {
                if (IsInputValid_Delete(bo))
                {
                    returnVal = _systemUserDAO.Delete(bo, userLogin);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "Delete_SystemUserBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }

        //// AccountType
        //public List<GetPagedListAccountTypeOutput> ViewAccountTypeGetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset)
        //{
        //    List<GetPagedListAccountTypeOutput> results = new List<GetPagedListAccountTypeOutput>();
        //    try
        //    {
        //        var dt = _systemUserDAO.ViewAccountTypeGetPagedList(keySearch, status, sort, order, pageSize, offset);
        //        if (dt != null && dt.Rows.Count > 0)
        //        {
        //            results = DataTableHelper.DataTableToList<GetPagedListAccountTypeOutput>(dt);
        //        }
        //    }
        //    catch (Exception objEx)
        //    {
        //        _responseMessage.Status = MessageStatus.Error;
        //        _responseMessage.Message = objEx.Message;

        //        // Gọi hàm InsertLog để log lỗi
        //        _ = LogHelper.InsertLog(
        //            title: "ViewAccountTypeGetPagedList_SystemUserBUS",
        //            content: objEx.Message,
        //            source: "RedeemGiftAPI",
        //            userLogin: _userLogin,
        //            parameter: results
        //        );
        //    }
        //    return results;
        //}

        //public int InsertAccountType(InsertAccountTypeInput bo, string userLogin)
        //{
        //    int returnVal = -1;
        //    if (IsInputValid_InsertAccountType(bo))
        //    {
        //        IData objData = Data.CreateData();
        //        objData.Connect();
        //        try
        //        {
        //            objData.BeginTransaction();
        //            returnVal = _systemUserDAO.InsertAccountType(bo, userLogin, objData);

        //            objData.Commit();
        //        }
        //        catch (Exception objEx)
        //        {
        //            _responseMessage.Status = MessageStatus.Error;
        //            _responseMessage.Message = objEx.Message;

        //            // Gọi hàm InsertLog để log lỗi
        //            _ = LogHelper.InsertLog(
        //                title: "InsertAccountType_SystemUserBUS",
        //                content: objEx.Message,
        //                source: "RedeemGiftAPI",
        //                userLogin: _userLogin,
        //                parameter: bo
        //            );
        //            objData.RollBack();

        //            returnVal = -1;
        //        }
        //        finally
        //        {
        //            objData.Disconnect();
        //        }
        //    }
        //    return returnVal;
        //}

        //public int UpdateAccountType(UpdateAccountTypeInput bo, string userLogin)
        //{
        //    int returnVal = -1;
        //    if (IsInputValid_UpdateAccountType(bo))
        //    {
        //        IData objData = Data.CreateData();
        //        objData.Connect();
        //        try
        //        {
        //            objData.BeginTransaction();
        //            returnVal = _systemUserDAO.UpdateAccountType(bo, userLogin, objData);

        //            objData.Commit();
        //        }
        //        catch (Exception objEx)
        //        {
        //            _responseMessage.Status = MessageStatus.Error;
        //            _responseMessage.Message = objEx.Message;

        //            // Gọi hàm InsertLog để log lỗi
        //            _ = LogHelper.InsertLog(
        //                title: "UpdateAccountType_SystemUserBUS",
        //                content: objEx.Message,
        //                source: "RedeemGiftAPI",
        //                userLogin: _userLogin,
        //                parameter: bo
        //            );
        //            objData.RollBack();

        //            returnVal = -1;
        //        }
        //        finally
        //        {
        //            objData.Disconnect();
        //        }
        //    }
        //    return returnVal;
        //}

        //public int UpdateAccountTypeStatus(int accountTypeID, int isActive, string userLogin)
        //{
        //    int returnVal = -1;

        //    IData objData = Data.CreateData();
        //    objData.Connect();
        //    try
        //    {
        //        objData.BeginTransaction();
        //        returnVal = _systemUserDAO.UpdateAccountTypeStatus(accountTypeID, isActive, userLogin, objData);

        //        objData.Commit();
        //    }
        //    catch (Exception objEx)
        //    {
        //        _responseMessage.Status = MessageStatus.Error;
        //        _responseMessage.Message = objEx.Message;

        //        // Gọi hàm InsertLog để log lỗi
        //        _ = LogHelper.InsertLog(
        //            title: "UpdateAccountTypeStatus_SystemUserBUS",
        //            content: objEx.Message,
        //            source: "RedeemGiftAPI",
        //            userLogin: _userLogin,
        //            parameter: accountTypeID
        //        );
        //        objData.RollBack();

        //        returnVal = -1;
        //    }
        //    finally
        //    {
        //        objData.Disconnect();
        //    }
        //    return returnVal;
        //}

        //public List<GetAllAccountTypeOutput> AccountTypeGetAll()
        //{
        //    List<GetAllAccountTypeOutput> results = new List<GetAllAccountTypeOutput>();
        //    try
        //    {
        //        var dt = _systemUserDAO.AccountTypeGetAll();
        //        if (dt != null && dt.Rows.Count > 0)
        //        {
        //            results = DataTableHelper.DataTableToList<GetAllAccountTypeOutput>(dt);
        //        }
        //    }
        //    catch (Exception objEx)
        //    {
        //        _responseMessage.Status = MessageStatus.Error;
        //        _responseMessage.Message = objEx.Message;

        //        // Gọi hàm InsertLog để log lỗi
        //        _ = LogHelper.InsertLog(
        //            title: "AccountTypeGetAll_SystemUserBUS",
        //            content: objEx.Message,
        //            source: "RedeemGiftAPI",
        //            userLogin: _userLogin,
        //            parameter: results
        //        );
        //    }
        //    return results;
        //}

        public List<GetListSupOutput> SupGetList()
        {
            List<GetListSupOutput> results = new List<GetListSupOutput>();
            try
            {
                var dt = _systemUserDAO.SupGetList();
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetListSupOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "SupGetList_SystemUserBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        #region validate
        private bool IsInputValid_Login(LoginSystemUserInput bo)
        {
            if (string.IsNullOrEmpty(bo.Username) || string.IsNullOrEmpty(bo.Password))
            {
                _responseMessage.Message = "Vui lòng nhập tài khoản và mật khẩu";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }

        private bool IsInputValid_Insert(InsertSystemUserInput bo)
        {
            if (string.IsNullOrEmpty(bo.Username))
            {
                _responseMessage.Message = "Vui lòng nhập mã nhân viên";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.FullName))
            {
                _responseMessage.Message = "Vui lòng nhập tên nhân viên";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (!string.IsNullOrEmpty(bo.Email) && !CommonHelper.IsValidEmail(bo.Email))
            {
                _responseMessage.Message = "Định dạng email không hợp lệ";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (!string.IsNullOrEmpty(bo.Phone) && bo.Phone.Length > 11)
            {
                _responseMessage.Message = "Định dạng số điện thoại phải ít hơn 12 số";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.RoleID))
            {
                _responseMessage.Message = "Vui lòng chọn quyền nhân viên";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }

        private bool IsInputValid_Update(UpdateSystemUserInput bo)
        {
            if (bo.UserID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy nhân viên này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.FullName))
            {
                _responseMessage.Message = "Vui lòng nhập tên nhân viên";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (!string.IsNullOrEmpty(bo.Email) && !CommonHelper.IsValidEmail(bo.Email))
            {
                _responseMessage.Message = "Định dạng email không hợp lệ";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (!string.IsNullOrEmpty(bo.Phone) && bo.Phone.Length > 11)
            {
                _responseMessage.Message = "Định dạng số điện thoại phải ít hơn 12 số";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }

        private bool IsInputValid_UpdatePassword(UpdatePasswordSystemUserInput bo, string userLogin)
        {
            if (string.IsNullOrEmpty(userLogin))
            {
                _responseMessage.Message = "Không tìm thấy nhân viên này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (!bo.IsReset &&
                (string.IsNullOrEmpty(bo.Password) ||
                string.IsNullOrEmpty(bo.NewPassword) ||
                string.IsNullOrEmpty((bo.ConfirmNewPassword))))
            {
                _responseMessage.Message = "Vui lòng nhập tất cả các trường mật khẩu bắt buộc.";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            // Kiểm tra mật khẩu hiện tại có đúng không
            if (!(bo.IsReset || BCrypt.Net.BCrypt.Verify(bo.Password, _systemUserDAO.GetPasswordByUsername(userLogin))))
            {
                _responseMessage.Message = "Mật khẩu hiện tại không đúng. Vui lòng nhập lại";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            // Kiểm tra mật khẩu mới và mật khẩu xác nhận có trùng khớp không
            if (!bo.IsReset && (bo.NewPassword != bo.ConfirmNewPassword))
            {
                _responseMessage.Message = "Mật khẩu xác nhận không trùng khớp với mật khẩu mới.";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            // Kiểm tra mật khẩu mới có trùng với mật khẩu hiện tại không
            if (!bo.IsReset && (bo.NewPassword == bo.Password))
            {
                _responseMessage.Message = "Mật khẩu mới không được trùng với mật khẩu hiện tại";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }

        private bool IsInputValid_Delete(DeleteSystemUserInput bo)
        {
            if (bo.UserID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy nhân viên này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }

        private bool IsInputValid_UpdateStatus(UpdateStatusSystemUserInput bo)
        {
            if (bo.UserID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy nhân viên này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }

        // AccountType
        private bool IsInputValid_InsertAccountType(InsertAccountTypeInput bo)
        {
            if (string.IsNullOrEmpty(bo.AccountTypeName))
            {
                _responseMessage.Message = "Vui lòng nhập tên loại tài khoản";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }

        private bool IsInputValid_UpdateAccountType(UpdateAccountTypeInput bo)
        {
            if (bo.AccountTypeID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy loại tài khoản này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.AccountTypeName))
            {
                _responseMessage.Message = "Vui lòng nhập tên loại tài khoản";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }
        #endregion
    }
}
