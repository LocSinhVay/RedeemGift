using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO;
using RedeemGiftAPI.Domain.DAO.CustomerSpin;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.CustomerSpin.Inputs;
using RedeemGiftAPI.Models.CustomerSpin.Outputs;

namespace RedeemGiftAPI.Domain.BUS.CustomerSpin
{
    public interface ICustomerSpinBUS : IBaseBUS
    {
        public List<GetPagedListCustomerSpinOutput> CustomerSpinGetPagedList(string keySearch, string projectCode, string sort, string order, int pageSize, int offset);
        public List<GetPagedListWinningsOutput> WinningsGetPagedList(string qrCode, string sort, string order, int pageSize, int offset);
        public Task<string> CreateSpinGrantAsync(SpinGrantInput bo, string userLogin);
        public int ClaimSpins(ClaimSpinsInput bo);
        //public List<GetDetailSpinInfoOutput> SpinInfoBySpinGrantIdGetDetail(string spinGrantId);
        public Task<List<GetDetailSpinInfoOutput>> SpinInfoBySpinGrantIdGetDetailAsync(string spinGrantId);
        //public SpinWheelOutput SpinWheel(string spinGrantId);
        public Task<SpinWheelOutput> SpinWheelAsync(string spinGrantId);

    }
    public class CustomerSpinBUS : BaseBUS, ICustomerSpinBUS
    {
        private readonly ICustomerSpinDAO _customerSpinDAO = null;
        private readonly IUploadFileHelper _uploadFileHelper = null;
        private readonly string attachDir = "BillImage";
        public CustomerSpinBUS(IHttpContextAccessor httpContextAccessor, ICustomerSpinDAO customerSpinDAO, IUploadFileHelper uploadFileHelper) : base(httpContextAccessor)
        {
            _customerSpinDAO = customerSpinDAO;
            _uploadFileHelper = uploadFileHelper;
        }

        public List<GetPagedListCustomerSpinOutput> CustomerSpinGetPagedList(string keySearch, string projectCode, string sort, string order, int pageSize, int offset)
        {
            List<GetPagedListCustomerSpinOutput> results = new List<GetPagedListCustomerSpinOutput>();
            try
            {
                var dt = _customerSpinDAO.CustomerSpinGetPagedList(keySearch, projectCode, sort, order, pageSize, offset);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetPagedListCustomerSpinOutput>(dt);
                    foreach (var item in results)
                    {
                        item.BillImagePath = _baseURL + FOLDER_FILE + item.BillImagePath;
                    }
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "CustomerSpinGetPagedList_CustomerSpinBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public List<GetPagedListWinningsOutput> WinningsGetPagedList(string qrCode, string sort, string order, int pageSize, int offset)
        {
            List<GetPagedListWinningsOutput> results = new List<GetPagedListWinningsOutput>();
            try
            {
                var dt = _customerSpinDAO.WinningsGetPagedList(qrCode, sort, order, pageSize, offset);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetPagedListWinningsOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "WinningsGetPagedList_CustomerSpinBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public async Task<string?> CreateSpinGrantAsync(SpinGrantInput bo, string userLogin)
        {
            if (!IsInputValid_CreateSpinGrant(bo))
                return null;

            if (bo.File is { Length: > 0 })
            {
                string timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
                string newFileName = Path.GetFileNameWithoutExtension(bo.File.FileName)
                                     + "_" + timestamp
                                     + Path.GetExtension(bo.File.FileName);

                bo.ImagePath = await _uploadFileHelper.UploadFileAsync(bo.File, attachDir, newFileName);
            }

            string? result = null;
            var objData = Data.CreateData();
            await objData.ConnectAsync();

            try
            {
                objData.BeginTransaction();
                result = await _customerSpinDAO.CreateSpinGrantAsync(bo, userLogin, objData);
                objData.Commit();
            }
            catch (Exception ex)
            {
                objData.RollBack();

                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = ex.Message;

                await LogHelper.InsertLog(
                    title: "CreateSpinGrant_CustomerSpinBUS",
                    content: ex.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: userLogin,
                    parameter: bo
                );

                result = null;
            }
            finally
            {
                objData.Disconnect();
            }

            return result;
        }

        //public List<GetDetailSpinInfoOutput> SpinInfoBySpinGrantIdGetDetail(string spinGrantId)
        //{
        //    List<GetDetailSpinInfoOutput> results = new List<GetDetailSpinInfoOutput>();
        //    try
        //    {
        //        var dt = _customerSpinDAO.SpinInfoBySpinGrantIdGetDetail(spinGrantId);
        //        if (dt != null && dt.Rows.Count > 0)
        //        {
        //            results = DataTableHelper.DataTableToList<GetDetailSpinInfoOutput>(dt);
        //        }
        //    }
        //    catch (Exception objEx)
        //    {
        //        _responseMessage.Status = MessageStatus.Error;
        //        _responseMessage.Message = objEx.Message;

        //        // Gọi hàm InsertLog để log lỗi
        //        _ = LogHelper.InsertLog(
        //            title: "SpinInfoBySpinGrantIdGetDetail_CustomerSpinBUS",
        //            content: objEx.Message,
        //            source: "PPL_RedeemGiftAPI",
        //            userLogin: _userLogin,
        //            parameter: results
        //        );
        //    }
        //    return results;
        //}

        public async Task<List<GetDetailSpinInfoOutput>> SpinInfoBySpinGrantIdGetDetailAsync(string spinGrantId)
        {
            List<GetDetailSpinInfoOutput> results = new();

            try
            {
                var dt = await _customerSpinDAO.SpinInfoBySpinGrantIdGetDetailAsync(spinGrantId);
                if (dt != null && dt.Rows.Count > 0)
                    results = DataTableHelper.DataTableToList<GetDetailSpinInfoOutput>(dt);
            }
            catch (Exception ex)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = ex.Message;

                await LogHelper.InsertLog(
                    title: "SpinInfoBySpinGrantIdGetDetail_CustomerSpinBUS",
                    content: ex.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: spinGrantId
                );
            }

            return results;
        }


        //public SpinWheelOutput SpinWheel(string spinGrantId)
        //{
        //    SpinWheelOutput output = null;
        //    try
        //    {
        //        // 1. Lấy danh sách giải thưởng theo SpinGrantID
        //        var prizeList = SpinInfoBySpinGrantIdGetDetail(spinGrantId);

        //        if (prizeList == null || prizeList.Count == 0)
        //            throw new Exception("Không tìm thấy giải thưởng nào.");

        //        // 2. Random theo trọng số
        //        var totalWeight = prizeList.Sum(p => p.Weight);
        //        var rand = new Random();
        //        var r = rand.Next(0, totalWeight);

        //        GetDetailSpinInfoOutput selectedPrize = null;
        //        foreach (var prize in prizeList)
        //        {
        //            if (r < prize.Weight)
        //            {
        //                selectedPrize = prize;
        //                break;
        //            }
        //            r -= prize.Weight;
        //        }

        //        if (selectedPrize == null)
        //            throw new Exception("Quay thưởng thất bại.");

        //        // 3. Lưu kết quả quay (nếu bạn có bảng SpinResult)
        //        var spinResult = new SpinResult
        //        {
        //            SpinGrantID = selectedPrize.SpinGrantID,
        //            PrizeID = selectedPrize.PrizeID,
        //        };
        //        var spinsRemaining = _customerSpinDAO.SaveSpinResult(spinResult);

        //        // 4. Trả về kết quả
        //        output = new SpinWheelOutput
        //        {
        //            PrizeID = selectedPrize.PrizeID,
        //            PrizeName = selectedPrize.PrizeName,
        //            SpinsRemaining = spinsRemaining
        //        };
        //    }
        //    catch (Exception objEx)
        //    {
        //        _responseMessage.Status = MessageStatus.Error;
        //        _responseMessage.Message = objEx.Message;

        //        _ = LogHelper.InsertLog(
        //            title: "SpinWheel_CustomerSpinBUS",
        //            content: objEx.Message,
        //            source: "PPL_RedeemGiftAPI",
        //            userLogin: _userLogin,
        //            parameter: spinGrantId
        //        );
        //    }
        //    return output;
        //}     

        public async Task<SpinWheelOutput?> SpinWheelAsync(string spinGrantId)
        {
            SpinWheelOutput? output = null;
            IData objData = null;

            try
            {
                // 1. Tạo kết nối & bắt đầu transaction
                objData = Data.CreateData();
                await objData.ConnectAsync();
                objData.BeginTransaction();

                // 2. Lấy danh sách giải thưởng
                var prizeList = await SpinInfoBySpinGrantIdGetDetailAsync(spinGrantId);

                if (prizeList == null || prizeList.Count == 0)
                    throw new Exception("Không tìm thấy giải thưởng nào.");

                // 3. Random theo trọng số
                var totalWeight = prizeList.Sum(p => p.Weight);
                var rand = new Random();
                var r = rand.Next(0, totalWeight);

                GetDetailSpinInfoOutput? selectedPrize = null;
                foreach (var prize in prizeList)
                {
                    if (r < prize.Weight)
                    {
                        selectedPrize = prize;
                        break;
                    }
                    r -= prize.Weight;
                }

                if (selectedPrize == null)
                    throw new Exception("Quay thưởng thất bại.");

                // 4. Lưu kết quả quay
                var spinResult = new SpinResult
                {
                    SpinGrantID = selectedPrize.SpinGrantID,
                    PrizeID = selectedPrize.PrizeID
                };

                var spinsRemaining = await _customerSpinDAO.SaveSpinResultAsync(spinResult, objData);

                if (spinsRemaining < 0)
                    throw new Exception("Lưu kết quả quay thất bại.");

                // Commit
                objData.Commit();

                output = new SpinWheelOutput
                {
                    PrizeID = selectedPrize.PrizeID,
                    PrizeName = selectedPrize.PrizeName,
                    SpinsRemaining = spinsRemaining
                };
            }
            catch (Exception ex)
            {
                // Rollback transaction
                objData?.RollBack();

                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = ex.Message;

                await LogHelper.InsertLog(
                    title: "SpinWheel_CustomerSpinBUS",
                    content: ex.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: spinGrantId
                );
            }
            finally
            {
                objData?.Disconnect();
            }

            return output;
        }

        public int ClaimSpins(ClaimSpinsInput bo)
        {
            int returnVal = -1;
            if (IsInputValid_ClaimSpins(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _customerSpinDAO.ClaimSpins(bo, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "ClaimSpins_CustomerSpinBUS",
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

        private bool IsInputValid_CreateSpinGrant(SpinGrantInput bo)
        {
            if (string.IsNullOrEmpty(bo.ProjectCode))
            {
                _responseMessage.Message = "Vui lòng gán dự án tương ứng";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.File == null)
            {
                _responseMessage.Message = "Vui lòng chụp hình tổng giá trị bill";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.BillValue <= 0)
            {
                _responseMessage.Message = "Vui lòng nhập tổng giá trị bill";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (bo.SpinsGranted <= 0)
            {
                _responseMessage.Message = "Vui lòng nhập số lượt quay";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }
            return true;
        }

        private bool IsInputValid_ClaimSpins(ClaimSpinsInput bo)
        {
            if (string.IsNullOrEmpty(bo.SpinGrantID))
            {
                _responseMessage.Message = "Không có mã truy cập hợp lệ";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.CustomerName))
            {
                _responseMessage.Message = "Vui lòng nhập Họ tên";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.CustomerPhone))
            {
                _responseMessage.Message = "Vui lòng nhập Số điện thoại";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }
    }
}
