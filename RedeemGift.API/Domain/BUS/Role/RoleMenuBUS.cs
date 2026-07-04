using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO;
using RedeemGiftAPI.Domain.DAO.Role;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.Role.Inputs;
using RedeemGiftAPI.Models.Role.Outputs;

namespace RedeemGiftAPI.Domain.BUS.Role
{
    public interface IRoleMenuBUS : IBaseBUS
    {
        public List<GetListRoleMenuOutput> GetList(int roleID);

        public int Insert(InsertRoleMenuInput bo, string userLogin, IData objData = null);

        public int Delete(DeleteRoleInput bo, string userLogin, IData objData = null);

    }
    public class RoleMenuBUS : BaseBUS, IRoleMenuBUS
    {
        private readonly IRoleMenuDAO _roleMenuDAO = null;
        public RoleMenuBUS(IHttpContextAccessor httpContextAccessor, IRoleMenuDAO roleMenuDAO) : base(httpContextAccessor)
        {
            _roleMenuDAO = roleMenuDAO;
        }

        public List<GetListRoleMenuOutput> GetList(int roleID)
        {
            List<GetListRoleMenuOutput> results = new List<GetListRoleMenuOutput>();
            try
            {
                var dt = _roleMenuDAO.GetList(roleID);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetListRoleMenuOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetList_RoleMenuBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public int Insert(InsertRoleMenuInput bo, string userLogin, IData objData = null)
        {
            int returnVal = -1;
            try
            {
                returnVal = _roleMenuDAO.Insert(bo, userLogin, objData);
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "Insert_RoleMenuBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }

        public int Delete(DeleteRoleInput bo, string userLogin, IData objData = null)
        {
            int returnVal = -1;
            try
            {
                returnVal = _roleMenuDAO.Delete(bo, userLogin, objData);
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "Delete_RoleMenuBUS",
                    content: objEx.Message,
                    source: "RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }
    }
}
