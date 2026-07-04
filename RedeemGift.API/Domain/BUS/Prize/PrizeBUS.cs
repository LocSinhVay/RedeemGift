using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO;
using RedeemGiftAPI.Domain.DAO.Prize;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.Prize.Inputs;
using RedeemGiftAPI.Models.Prize.Outputs;

namespace RedeemGiftAPI.Domain.BUS.Prize
{
    public interface IPrizeBUS : IBaseBUS
    {
        public List<GetPagedListPrizeOutput> PrizeGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset);

        public List<GetListPrizeOutput> GetPrizesByProject(string projectCode);

        public int InsertPrize(InsertPrizeInput bo, string userLogin);

        public int UpdatePrize(UpdatePrizeInput bo, string userLogin);

        public int DeletePrize(DeletePrizeInput bo, string userLogin);

    }
    public class PrizeBUS : BaseBUS, IPrizeBUS
    {
        private readonly IPrizeDAO _prizeDAO = null;
        public PrizeBUS(IHttpContextAccessor httpContextAccessor, IPrizeDAO prizeDAO) : base(httpContextAccessor)
        {
            _prizeDAO = prizeDAO;
        }

        public List<GetPagedListPrizeOutput> PrizeGetPagedList(string keySearch, string projectCode, int status, string sort, string order, int pageSize, int offset)
        {
            List<GetPagedListPrizeOutput> results = new List<GetPagedListPrizeOutput>();
            try
            {
                var dt = _prizeDAO.PrizeGetPagedList(keySearch, projectCode, status, sort, order, pageSize, offset);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetPagedListPrizeOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "PrizeGetPagedList_PrizeBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public List<GetListPrizeOutput> GetPrizesByProject(string projectCode)
        {
            List<GetListPrizeOutput> results = new List<GetListPrizeOutput>();
            try
            {
                var dt = _prizeDAO.GetPrizesByProject(projectCode);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetListPrizeOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetPrizesByProject_PrizeBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public int InsertPrize(InsertPrizeInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Insert(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _prizeDAO.InsertPrize(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "InsertPrize_PrizeBUS",
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

        public int UpdatePrize(UpdatePrizeInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Update(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _prizeDAO.UpdatePrize(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "UpdatePrize_PrizeBUS",
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

        public int DeletePrize(DeletePrizeInput bo, string userLogin)
        {
            int returnVal = -1;
            try
            {
                if (IsInputValid_Delete(bo))
                {
                    returnVal = _prizeDAO.DeletePrize(bo, userLogin);
                }

            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "DeletePrize_PrizeBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: bo
                );
            }
            return returnVal;
        }


        private bool IsInputValid_Insert(InsertPrizeInput bo)
        {
            if (string.IsNullOrEmpty(bo.ProjectCode))
            {
                _responseMessage.Message = "Vui lòng chọn dự án";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.GiftID <= 0)
            {
                _responseMessage.Message = "Vui lòng chọn giải thưởng";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.Weight == 0)
            {
                _responseMessage.Message = "Vui lòng nhập tỷ trọng giải thưởng";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }

        private bool IsInputValid_Update(UpdatePrizeInput bo)
        {
            if (bo.PrizeID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy Giải thưởng này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.ProjectCode))
            {
                _responseMessage.Message = "Vui lòng chọn dự án";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.GiftID <= 0)
            {
                _responseMessage.Message = "Vui lòng chọn giải thưởng";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.Weight == 0)
            {
                _responseMessage.Message = "Vui lòng nhập tỷ trọng giải thưởng";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }

        private bool IsInputValid_Delete(DeletePrizeInput bo)
        {
            if (bo.PrizeID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy Giải thưởng này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }
    }
}
