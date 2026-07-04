using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO;
using RedeemGiftAPI.Domain.DAO.RedeemSpin;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.RedeemSpin.Inputs;
using RedeemGiftAPI.Models.RedeemSpin.Outputs;

namespace RedeemGiftAPI.Domain.BUS.RedeemSpin
{
    public interface IRedeemSpinBUS : IBaseBUS
    {
        public List<GetPagedListRedeemSpinOutput> RedeemSpinGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset);

        public int InsertRedeemSpin(InsertRedeemSpinInput bo, string userLogin);

        public int UpdateRedeemSpin(UpdateRedeemSpinInput bo, string userLogin);

        public int DeleteRedeemSpin(DeleteRedeemSpinInput bo, string userLogin);
        public List<GetlistRedemptionRuleOutput> RedemptionRuleByProjectGetList(string projectCode);

    }
    public class RedeemSpinBUS : BaseBUS, IRedeemSpinBUS
    {
        private readonly IRedeemSpinDAO _redeemSpinDAO = null;
        public RedeemSpinBUS(IHttpContextAccessor httpContextAccessor, IRedeemSpinDAO redeemSpinDAO) : base(httpContextAccessor)
        {
            _redeemSpinDAO = redeemSpinDAO;
        }

        public List<GetPagedListRedeemSpinOutput> RedeemSpinGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset)
        {
            List<GetPagedListRedeemSpinOutput> results = new List<GetPagedListRedeemSpinOutput>();
            try
            {
                var dt = _redeemSpinDAO.RedeemSpinGetPagedList(keySearch, projectCode, status, sort, order, pageSize, offset);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetPagedListRedeemSpinOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "RedeemSpinGetPagedList_RedeemSpinBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public List<GetlistRedemptionRuleOutput> RedemptionRuleByProjectGetList(string projectCode)
        {
            List<GetlistRedemptionRuleOutput> result = new List<GetlistRedemptionRuleOutput>();
            try
            {
                var dt = _redeemSpinDAO.RedemptionRuleByProjectGetList(projectCode);
                if (dt != null && dt.Rows.Count > 0)
                {
                    result = DataTableHelper.DataTableToList<GetlistRedemptionRuleOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "RedemptionRuleByProjectGetList_RedeemSpinBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: result
                );
            }
            return result;
        }

        public int InsertRedeemSpin(InsertRedeemSpinInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Insert(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _redeemSpinDAO.InsertRedeemSpin(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "InsertRedeemSpin_RedeemSpinBUS",
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

        public int UpdateRedeemSpin(UpdateRedeemSpinInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Update(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _redeemSpinDAO.UpdateRedeemSpin(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "UpdateRedeemSpin_RedeemSpinBUS",
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

        public int DeleteRedeemSpin(DeleteRedeemSpinInput bo, string userLogin)
        {
            int returnVal = -1;
            try
            {
                if (IsInputValid_Delete(bo))
                {
                    returnVal = _redeemSpinDAO.DeleteRedeemSpin(bo, userLogin);
                }

            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "DeleteRedeemSpin_RedeemSpinBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }


        private bool IsInputValid_Insert(InsertRedeemSpinInput bo)
        {
            if (string.IsNullOrEmpty(bo.ProjectCode))
            {
                _responseMessage.Message = "Vui lòng chọn dự án";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.BillValuePerSpin <= 0)
            {
                _responseMessage.Message = "Vui lòng nhập giá trị quy đổi";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            if (bo.MaxSpinsPerBill <= 0)
            {
                _responseMessage.Message = "Vui lòng nhập số lượt";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (!bo.StartDate.HasValue)
            {
                _responseMessage.Message = "Vui lòng nhập Từ ngày";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (!bo.EndDate.HasValue)
            {
                _responseMessage.Message = "Vui lòng nhập Đến ngày";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.StartDate > bo.EndDate)
            {
                _responseMessage.Message = "Từ ngày không được lớn hơn Đến ngày";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }

        private bool IsInputValid_Update(UpdateRedeemSpinInput bo)
        {
            if (bo.RuleID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy Tỷ lệ quy đổi này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.ProjectCode))
            {
                _responseMessage.Message = "Vui lòng chọn dự án";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.BillValuePerSpin <= 0)
            {
                _responseMessage.Message = "Vui lòng nhập giá trị quy đổi";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            if (bo.MaxSpinsPerBill <= 0)
            {
                _responseMessage.Message = "Vui lòng nhập số lượt";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (!bo.StartDate.HasValue)
            {
                _responseMessage.Message = "Vui lòng nhập Từ ngày";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (!bo.EndDate.HasValue)
            {
                _responseMessage.Message = "Vui lòng nhập Đến ngày";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.StartDate > bo.EndDate)
            {
                _responseMessage.Message = "Từ ngày không được lớn hơn Đến ngày";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }

        private bool IsInputValid_Delete(DeleteRedeemSpinInput bo)
        {
            if (bo.RuleID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy Tỷ lệ quy đổi này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }
    }
}
