using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO;
using RedeemGiftAPI.Domain.DAO.Role;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.Role.Inputs;
using RedeemGiftAPI.Models.Role.Outputs;

namespace RedeemGiftAPI.Domain.BUS.Role
{
    public interface IRoleBUS : IBaseBUS
    {
        public List<GetPagedListRoleOutput> GetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset);

        //public List<GetListRoleMenuOutput> GetAll();

        public int Insert(InsertRoleInput bo, string userLogin);

        public int Update(UpdateRoleInput bo, string userLogin);

        public int Delete(DeleteRoleInput bo, string userLogin);

    }
    public class RoleBUS : BaseBUS, IRoleBUS
    {
        private readonly IRoleDAO _roleDAO = null;
        private readonly IRoleMenuBUS _roleMenuBUS = null;
        public RoleBUS(IHttpContextAccessor httpContextAccessor, IRoleDAO roleDAO, IRoleMenuBUS roleMenuBUS) : base(httpContextAccessor)
        {
            _roleDAO = roleDAO;
            _roleMenuBUS = roleMenuBUS;
        }

        public List<GetPagedListRoleOutput> GetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset)
        {
            List<GetPagedListRoleOutput> results = new List<GetPagedListRoleOutput>();
            try
            {
                var dt = _roleDAO.GetPagedList(keySearch, status, sort, order, pageSize, offset);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetPagedListRoleOutput>(dt);

                    // RoleMenu
                    foreach (var item in results)
                    {
                        List<GetListRoleMenuOutput> listRoleMenu = _roleMenuBUS.GetList(item.RoleID);
                        _responseMessage = _roleMenuBUS.GetResponseMessage();
                        if (_responseMessage.Status != MessageStatus.Success)
                        {
                            return new List<GetPagedListRoleOutput>();
                        }
                        item.listRoleMenu = listRoleMenu;
                    }
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetPagedList_RoleBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        //public List<GetListRoleMenuOutput> GetAll()
        //{
        //    List<GetListRoleMenuOutput> results = new List<GetListRoleMenuOutput>();
        //    try
        //    {
        //        var dt = _roleDAO.GetAll();
        //        if (dt != null && dt.Rows.Count > 0)
        //        {
        //            results = DataTableHelper.DataTableToList<GetListRoleMenuOutput>(dt);
        //        }
        //    }
        //    catch (Exception objEx)
        //    {
        //        _responseMessage.Status = MessageStatus.Error;
        //        _responseMessage.Message = objEx.Message;

        //        // Gọi hàm InsertLog để log lỗi
        //        _ = LogHelper.InsertLog(
        //            title: "GetAll_RoleBUS",
        //            content: objEx.Message,
        //            source: "RedeemGiftAPI",
        //            userLogin: _userLogin,
        //            parameter: results
        //        );
        //    }
        //    return results;
        //}

        public int Insert(InsertRoleInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Insert(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _roleDAO.Insert(bo, userLogin, objData);

                    // RoleMenu
                    if (bo.listRoleMenu != null)
                    {
                        bo.listRoleMenu.ForEach(x => x.RoleID = returnVal);
                        foreach (var item in bo.listRoleMenu)
                        {
                            _roleMenuBUS.Insert(item, userLogin, objData);
                            _responseMessage = _roleMenuBUS.GetResponseMessage();
                            if (_responseMessage.Status != MessageStatus.Success)
                            {
                                objData.RollBack();
                                return -1;
                            }
                        }
                    }

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "Insert_RoleBUS",
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

        public int Update(UpdateRoleInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Update(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _roleDAO.Update(bo, userLogin, objData);

                    // RoleMenu
                    DeleteRoleInput deleteRoleInput = new DeleteRoleInput()
                    {
                        RoleID = bo.RoleID
                    };

                    _roleMenuBUS.Delete(deleteRoleInput, userLogin, objData);
                    _responseMessage = _roleMenuBUS.GetResponseMessage();
                    if (_responseMessage.Status != MessageStatus.Success)
                    {
                        objData.RollBack();
                        return -1;
                    }

                    if (bo.listRoleMenu != null)
                    {
                        bo.listRoleMenu.ForEach(x => x.RoleID = bo.RoleID);
                        foreach (var item in bo.listRoleMenu)
                        {
                            _roleMenuBUS.Insert(item, userLogin, objData);
                            _responseMessage = _roleMenuBUS.GetResponseMessage();
                            if (_responseMessage.Status != MessageStatus.Success)
                            {
                                objData.RollBack();
                                return -1;
                            }
                        }
                    }

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "Update_RoleBUS",
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

        public int Delete(DeleteRoleInput bo, string userLogin)
        {
            int returnVal = -1;
            try
            {
                if (IsInputValid_Delete(bo))
                {
                    returnVal = _roleDAO.Delete(bo, userLogin);
                }

            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "Delete_RoleBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }


        private bool IsInputValid_Insert(InsertRoleInput bo)
        {
            if (string.IsNullOrEmpty(bo.RoleName))
            {
                _responseMessage.Message = "Vui lòng nhập tên Quyền";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.Symbol))
            {
                _responseMessage.Message = "Vui lòng nhập Ký hiệu";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }

        private bool IsInputValid_Update(UpdateRoleInput bo)
        {
            if (bo.RoleID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy Quyền này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.RoleName))
            {
                _responseMessage.Message = "Vui lòng nhập tên Quyền";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.Symbol))
            {
                _responseMessage.Message = "Vui lòng nhập Ký hiệu";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }

        private bool IsInputValid_Delete(DeleteRoleInput bo)
        {
            if (bo.RoleID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy Quyền này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }
    }
}
