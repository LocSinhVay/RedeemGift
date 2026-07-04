using RedeemGiftAPI.Models.CustomerSpin.Inputs;
using RedeemGiftAPI.Models.CustomerSpin.Outputs;
using System.Data;

namespace RedeemGiftAPI.Domain.DAO.CustomerSpin
{
    public interface ICustomerSpinDAO
    {
        public DataTable CustomerSpinGetPagedList(string keySearch, string projectCode, string sort, string order, int pageSize, int offset);
        public DataTable WinningsGetPagedList(string qrCode, string sort, string order, int pageSize, int offset);
        //public DataTable SpinInfoBySpinGrantIdGetDetail(string spinGrantId);
        public Task<DataTable> SpinInfoBySpinGrantIdGetDetailAsync(string spinGrantId);
        public int ClaimSpins(ClaimSpinsInput bo, IData objData = null);
        //public string CreateSpinGrant(SpinGrantInput bo, string userLogin, IData objData = null);
        public Task<string> CreateSpinGrantAsync(SpinGrantInput bo, string userLogin, IData objData);
        //public int SaveSpinResult(SpinResult bo, IData objData = null);
        public Task<int> SaveSpinResultAsync(SpinResult bo, IData objData = null);

    }
    public class CustomerSpinDAO : ICustomerSpinDAO
    {
        private IData objData = null;
        public DataTable CustomerSpinGetPagedList(string keySearch, string projectCode, string sort, string order, int pageSize, int offset)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_CustomerSpin_GetPagedList");
                objData.AddParameter("@PageSize", pageSize);

                objData.AddParameter("@Offset", offset);
                objData.AddParameter("@Sort", sort);
                objData.AddParameter("@Order", order);

                objData.AddParameter("@KeySearch", keySearch);
                objData.AddParameter("@ProjectCode", projectCode);

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

        public DataTable WinningsGetPagedList(string qrCode, string sort, string order, int pageSize, int offset)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Winnings_GetPagedList");
                objData.AddParameter("@PageSize", pageSize);

                objData.AddParameter("@Offset", offset);
                objData.AddParameter("@Sort", sort);
                objData.AddParameter("@Order", order);

                objData.AddParameter("@QRCode", qrCode);

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

        //public string CreateSpinGrant(SpinGrantInput bo, string userLogin, IData objData = null)
        //{
        //    bool isConnection = false;
        //    var dt = string.Empty;

        //    try
        //    {
        //        if (objData == null || !objData.IsConnected())
        //        {
        //            objData = Data.CreateData();
        //            objData.Connect();
        //            isConnection = true;
        //        }

        //        objData.CreateNewStoredProcedure("PPL_CreateSpinGrant");

        //        objData.AddParameter("@ProjectCode", bo.ProjectCode);
        //        objData.AddParameter("@RuleID", bo.RuleID);
        //        objData.AddParameter("@BillValue", bo.BillValue);
        //        objData.AddParameter("@ImagePath", bo.ImagePath);
        //        objData.AddParameter("@SpinsGranted", bo.SpinsGranted);
        //        objData.AddParameter("@UserLogin", userLogin);

        //        dt = objData.ExecStoreToString();
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }
        //    finally
        //    {
        //        if (isConnection)
        //        {
        //            objData.Disconnect();
        //        }
        //    }

        //    return dt;
        //}

        public async Task<string> CreateSpinGrantAsync(SpinGrantInput bo, string userLogin, IData objData = null)
        {
            bool isConnection = false;
            string result;

            try
            {
                if (objData == null || !objData.IsConnected())
                {
                    objData = Data.CreateData();
                    await objData.ConnectAsync();
                    isConnection = true;
                }

                objData.CreateNewStoredProcedure("PPL_CreateSpinGrant");
                objData.AddParameter("@ProjectCode", bo.ProjectCode);
                objData.AddParameter("@RuleID", bo.RuleID);
                objData.AddParameter("@BillValue", bo.BillValue);
                objData.AddParameter("@ImagePath", bo.ImagePath);
                objData.AddParameter("@SpinsGranted", bo.SpinsGranted);
                objData.AddParameter("@UserLogin", userLogin);

                result = await objData.ExecStoreToStringAsync();
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

            return result;
        }


        //public DataTable SpinInfoBySpinGrantIdGetDetail(string spinGrantId)
        //{
        //    DataTable dt = new DataTable();
        //    objData = Data.CreateData();
        //    try
        //    {
        //        objData.Connect();
        //        objData.CreateNewStoredProcedure("PPL_SpinInfoBySpinGrantId_GetDetail");
        //        objData.AddParameter("@SpinGrantId", spinGrantId);

        //        dt = objData.ExecStoreToDataTable();
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }
        //    finally
        //    {
        //        objData.Disconnect();
        //    }
        //    return dt;
        //}

        public async Task<DataTable> SpinInfoBySpinGrantIdGetDetailAsync(string spinGrantId)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                await objData.ConnectAsync();
                objData.CreateNewStoredProcedure("PPL_SpinInfoBySpinGrantId_GetDetail");
                objData.AddParameter("@SpinGrantId", spinGrantId);

                dt = await objData.ExecStoreToDataTableAsync();
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

        public int ClaimSpins(ClaimSpinsInput bo, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_ClaimSpins");
                objData.AddParameter("@SpinGrantID", bo.SpinGrantID);
                objData.AddParameter("@CustomerName", bo.CustomerName);
                objData.AddParameter("@CustomerPhone", bo.CustomerPhone);

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

        //public int SaveSpinResult(SpinResult bo, IData objData = null)
        //{
        //    bool isConnection = false;
        //    int spinsRemaining = -1; // Mặc định -1 để nhận biết lỗi
        //    try
        //    {
        //        if (objData == null || !objData.IsConnected())
        //        {
        //            objData = Data.CreateData();
        //            objData.Connect();
        //            isConnection = true;
        //        }

        //        objData.CreateNewStoredProcedure("PPL_ExecuteSpin");
        //        objData.AddParameter("@SpinGrantID", bo.SpinGrantID);
        //        objData.AddParameter("@WinningPrizeID", bo.PrizeID);

        //        // Vì proc trả về SELECT @SpinsAvailable AS SpinsRemaining
        //        var dt = objData.ExecStoreToDataTable();
        //        if (dt != null && dt.Rows.Count > 0)
        //        {
        //            spinsRemaining = Convert.ToInt32(dt.Rows[0]["SpinsRemaining"]);
        //        }
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }
        //    finally
        //    {
        //        if (isConnection)
        //        {
        //            objData.Disconnect();
        //        }
        //    }
        //    return spinsRemaining;
        //}

        public async Task<int> SaveSpinResultAsync(SpinResult bo, IData objData)
        {
            bool isConnection = false;
            int spinsRemaining = -1; // Mặc định -1 để nhận biết lỗi
            try
            {
                if (objData == null || !objData.IsConnected())
                {
                    objData = Data.CreateData();
                    objData.Connect();
                    isConnection = true;
                }

                objData.CreateNewStoredProcedure("PPL_ExecuteSpin");
                objData.AddParameter("@SpinGrantID", bo.SpinGrantID);
                objData.AddParameter("@WinningPrizeID", bo.PrizeID);

                // Vì proc trả về SELECT @SpinsAvailable AS SpinsRemaining
                var dt = await objData.ExecStoreToDataTableAsync();
                if (dt != null && dt.Rows.Count > 0)
                {
                    spinsRemaining = Convert.ToInt32(dt.Rows[0]["SpinsRemaining"]);
                }
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
            return spinsRemaining;
        }
    }
}
