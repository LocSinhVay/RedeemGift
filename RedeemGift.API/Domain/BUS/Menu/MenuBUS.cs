using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO;
using RedeemGiftAPI.Domain.DAO.Menu;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.Menu.Inputs;
using RedeemGiftAPI.Models.Menu.Outputs;

namespace RedeemGiftAPI.Domain.BUS.Menu
{
    public interface IMenuBUS : IBaseBUS
    {
        public List<GetPagedListMenuOutput> GetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset);

        public List<GetAllMenuOutput> GetAll();

        public List<GetListSystemMenuOutput> GetMenu(int roleID);

        public int Insert(InsertMenuInput bo, string userLogin);

        public int Update(UpdateMenuInput bo, string userLogin);

        public int Delete(DeleteMenuInput bo, string userLogin);

    }
    public class MenuBUS : BaseBUS, IMenuBUS
    {
        private readonly IMenuDAO _menuDAO = null;
        public MenuBUS(IHttpContextAccessor httpContextAccessor, IMenuDAO menuDAO) : base(httpContextAccessor)
        {
            _menuDAO = menuDAO;
        }

        public List<GetPagedListMenuOutput> GetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset)
        {
            List<GetPagedListMenuOutput> results = new List<GetPagedListMenuOutput>();
            try
            {
                var dt = _menuDAO.GetPagedList(keySearch, status, sort, order, pageSize, offset);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetPagedListMenuOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetPagedList_MenuBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public List<GetAllMenuOutput> GetAll()
        {
            List<GetAllMenuOutput> results = new List<GetAllMenuOutput>();
            try
            {
                var dt = _menuDAO.GetAll();
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetAllMenuOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetAll_MenuBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public List<GetListSystemMenuOutput> GetMenu(int roleID)
        {
            List<GetListSystemMenuOutput> results = new List<GetListSystemMenuOutput>();
            try
            {
                var dt = _menuDAO.GetMenu(roleID);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetListSystemMenuOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetMenu_MenuBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public int Insert(InsertMenuInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Insert(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _menuDAO.Insert(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "Insert_MenuBUS",
                        content: objEx.Message,
                        source: "PPL_RedeemGiftAPI",
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

        public int Update(UpdateMenuInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Update(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _menuDAO.Update(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "Update_MenuBUS",
                        content: objEx.Message,
                        source: "PPL_RedeemGiftAPI",
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

        public int Delete(DeleteMenuInput bo, string userLogin)
        {
            int returnVal = -1;
            try
            {
                if (IsInputValid_Delete(bo))
                {
                    returnVal = _menuDAO.Delete(bo, userLogin);
                }

            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "Delete_MenuBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }


        private bool IsInputValid_Insert(InsertMenuInput bo)
        {
            if (string.IsNullOrEmpty(bo.MenuName))
            {
                _responseMessage.Message = "Vui lòng nhập tên menu";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }

        private bool IsInputValid_Update(UpdateMenuInput bo)
        {
            if (bo.MenuID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy menu này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.MenuName))
            {
                _responseMessage.Message = "Vui lòng nhập tên menu";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }

        private bool IsInputValid_Delete(DeleteMenuInput bo)
        {
            if (bo.MenuID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy menu này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }
    }
}
