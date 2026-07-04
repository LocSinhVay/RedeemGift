using RedeemGiftAPI.Domain.BUS.Helper;
using RedeemGiftAPI.Domain.DAO;
using RedeemGiftAPI.Domain.DAO.Project;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.Project.Inputs;
using RedeemGiftAPI.Models.Project.Outputs;

namespace RedeemGiftAPI.Domain.BUS.Project
{
    public interface IProjectBUS : IBaseBUS
    {
        public List<GetPagedListProductOutput> ProjectGetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset);

        public int InsertProject(InsertProjectInput bo, string userLogin);

        public int UpdateProject(UpdateProjectInput bo, string userLogin);

        public int UpdateProjectStatus(int id, int status, string userLogin);
        public List<GetAllProjectOutput> GetAllProject();

    }
    public class ProjectBUS : BaseBUS, IProjectBUS
    {
        private readonly IProjectDAO _projectDAO = null;
        public ProjectBUS(IHttpContextAccessor httpContextAccessor, IProjectDAO projectDAO) : base(httpContextAccessor)
        {
            _projectDAO = projectDAO;
        }

        public List<GetPagedListProductOutput> ProjectGetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset)
        {
            List<GetPagedListProductOutput> results = new List<GetPagedListProductOutput>();
            try
            {
                var dt = _projectDAO.ProjectGetPagedList(keySearch, status, sort, order, pageSize, offset);
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetPagedListProductOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "ProjectGetPagedList_ProjectBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        public int InsertProject(InsertProjectInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Insert(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _projectDAO.InsertProject(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "InsertProject_ProjectBUS",
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

        public int UpdateProject(UpdateProjectInput bo, string userLogin)
        {
            int returnVal = -1;
            if (IsInputValid_Update(bo))
            {
                IData objData = Data.CreateData();
                objData.Connect();
                try
                {
                    objData.BeginTransaction();
                    returnVal = _projectDAO.UpdateProject(bo, userLogin, objData);

                    objData.Commit();
                }
                catch (Exception objEx)
                {
                    _responseMessage.Status = MessageStatus.Error;
                    _responseMessage.Message = objEx.Message;

                    // Gọi hàm InsertLog để log lỗi
                    _ = LogHelper.InsertLog(
                        title: "UpdateProject_ProjectBUS",
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

        public int UpdateProjectStatus(int id, int status, string userLogin)
        {
            int returnVal = -1;

            IData objData = Data.CreateData();
            objData.Connect();
            try
            {
                objData.BeginTransaction();
                returnVal = _projectDAO.UpdateProjectStatus(id, status, userLogin, objData);

                objData.Commit();
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "UpdateProjectStatus_ProjectBUS",
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

        public List<GetAllProjectOutput> GetAllProject()
        {
            List<GetAllProjectOutput> results = new List<GetAllProjectOutput>();
            try
            {
                var dt = _projectDAO.GetAllProject();
                if (dt != null && dt.Rows.Count > 0)
                {
                    results = DataTableHelper.DataTableToList<GetAllProjectOutput>(dt);
                }
            }
            catch (Exception objEx)
            {
                _responseMessage.Status = MessageStatus.Error;
                _responseMessage.Message = objEx.Message;

                // Gọi hàm InsertLog để log lỗi
                _ = LogHelper.InsertLog(
                    title: "GetAllProject_ProjectBUS",
                    content: objEx.Message,
                    source: "PPL_RedeemGiftAPI",
                    userLogin: _userLogin,
                    parameter: results
                );
            }
            return results;
        }

        private bool IsInputValid_Insert(InsertProjectInput bo)
        {
            if (string.IsNullOrEmpty(bo.ProjectCode))
            {
                _responseMessage.Message = "Vui lòng nhập mã dự án";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.ProjectName))
            {
                _responseMessage.Message = "Vui lòng nhập tên dự án";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }

        private bool IsInputValid_Update(UpdateProjectInput bo)
        {
            if (bo.ProjectID <= 0)
            {
                _responseMessage.Message = "Không tìm thấy dự án này trong hệ thống";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.ProjectCode))
            {
                _responseMessage.Message = "Vui lòng nhập mã dự án";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            if (string.IsNullOrEmpty(bo.ProjectName))
            {
                _responseMessage.Message = "Vui lòng nhập tên dự án";
                _responseMessage.Status = MessageStatus.Warning;
                return false;
            }

            return true;
        }
    }
}
