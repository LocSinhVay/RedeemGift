using RedeemGiftAPI.Models.Project.Inputs;
using System.Data;

namespace RedeemGiftAPI.Domain.DAO.Project
{
    public interface IProjectDAO
    {
        public DataTable GetAllProject();
        public DataTable ProjectGetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset);
        public int UpdateProjectStatus(int id, int status, string userLogin, IData objData = null);
        public int InsertProject(InsertProjectInput bo, string userLogin, IData objData = null);
        public int UpdateProject(UpdateProjectInput bo, string userLogin, IData objData = null);
    }
    public class ProjectDAO : IProjectDAO
    {
        private IData objData = null;

        public DataTable ProjectGetPagedList(string keySearch, int status, string sort, string order, int pageSize, int offset)
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_Project_GetPagedList");
                objData.AddParameter("@PageSize", pageSize);
                objData.AddParameter("@Offset", offset);
                objData.AddParameter("@Sort", sort);
                objData.AddParameter("@Order", order);
                objData.AddParameter("@KeySearch", keySearch);
                objData.AddParameter("@Status", status);
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

        public int UpdateProjectStatus(int id, int status, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Project_Status_Update");
                objData.AddParameter("@ProjectID", id);
                objData.AddParameter("@Status", status);
                objData.AddParameter("@UserLogin", userLogin);

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

        public int InsertProject(InsertProjectInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Project_Insert");
                objData.AddParameter("@ProjectCode", bo.ProjectCode);
                objData.AddParameter("@ProjectName", bo.ProjectName);
                objData.AddParameter("@UserLogin", userLogin);
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

        public int UpdateProject(UpdateProjectInput bo, string userLogin, IData objData = null)
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

                objData.CreateNewStoredProcedure("PPL_Project_Update");
                objData.AddParameter("@ProjectID", bo.ProjectID);
                objData.AddParameter("@ProjectCode", bo.ProjectCode);
                objData.AddParameter("@ProjectName", bo.ProjectName);
                objData.AddParameter("@UserLogin", userLogin);

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

        public DataTable GetAllProject()
        {
            DataTable dt = new DataTable();
            objData = Data.CreateData();
            try
            {
                objData.Connect();
                objData.CreateNewStoredProcedure("PPL_GetActiveProjects");
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
    }
}
