using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO;
using RedeemGiftAPI.Domain.DAO.Gift;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.Gift.Inputs;
using RedeemGiftAPI.Models.Gift.Outputs;

namespace RedeemGiftAPI.Domain.BUS.Gift
{
    public interface IGiftBUS : IBaseBUS
    {
        public List<GetPagedListGiftOutput> GiftGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset);

        public int InsertGift(InsertGiftInput bo, string userLogin);

        public int UpdateGift(UpdateGiftInput bo, string userLogin);

        public int UpdateGiftStatus(int id, int status, string userLogin);
    }
    public class GiftBUS : BaseBUS, IGiftBUS
    {
        private readonly IGiftDAO _GiftDAO = null;
        public GiftBUS(IHttpContextAccessor httpContextAccessor, IGiftDAO GiftDAO) : base(httpContextAccessor)
        {
            _GiftDAO = GiftDAO;
        }

        public List<GetPagedListGiftOutput> GiftGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset)
        {
            List<GetPagedListGiftOutput> results = new List<GetPagedListGiftOutput>();
            try
            {
                var dt = _GiftDAO.GiftGetPagedList(keySearch, projectCode, status, sort, order, pageSize, offset);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetPagedListGiftOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GiftGetPagedList_GiftBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public int InsertGift(InsertGiftInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Insert(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _GiftDAO.InsertGift(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "InsertGift_GiftBUS",
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

        public int UpdateGift(UpdateGiftInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Update(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _GiftDAO.UpdateGift(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "UpdateGift_GiftBUS",
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

        public int UpdateGiftStatus(int id, int status, string userLogin)
        {
            int returnVal = -1;

            IData objData = Data.CreateData();
            objData.Connect();
            try
            {
                objData.BeginTransaction();
                returnVal = _GiftDAO.UpdateGiftStatus(id, status, userLogin, objData);

                objData.Commit();
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "UpdateGiftStatus_GiftBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: status
                );
                objData.RollBack();

                returnVal = -1;
            }
            finally
            {
                objData.Disconnect();
            }
            return returnVal;
        }

        private bool IsInputValid_Insert(InsertGiftInput bo)
        {
            if (string.IsNullOrEmpty(bo.ProjectCode))
            {
                _responseMessage.Message = "Vui lòng chọn dự án";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.GiftName))
            {
                _responseMessage.Message = "Vui lòng nhập tên sản phẩm";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }

        private bool IsInputValid_Update(UpdateGiftInput bo)
        {
            if (bo.GiftID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy sản phẩm này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.ProjectCode))
            {
                _responseMessage.Message = "Vui lòng chọn dự án";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.GiftName))
            {
                _responseMessage.Message = "Vui lòng nhập tên sản phẩm";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }
    }
}
