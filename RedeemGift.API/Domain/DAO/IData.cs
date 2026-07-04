using RedeemGiftAPI.Domain.BUS.Helper;
using System.Data;
using System.Data.SqlClient;

namespace RedeemGiftAPI.Domain.DAO
{
    public interface IData
    {
        // Connection
        void Connect();
        Task ConnectAsync();
        void Disconnect();
        bool IsConnected();

        // Transaction
        void BeginTransaction();
        void Commit();
        void RollBack();

        // Command setup
        void CreateNewStoredProcedure(string store);
        void AddParameter(string key, object value);

        // Execute (Sync + Async)
        DataTable ExecStoreToDataTable();
        Task<DataTable> ExecStoreToDataTableAsync();

        void ExecNonQuery();
        Task ExecNonQueryAsync();

        string ExecStoreToString();
        Task<string> ExecStoreToStringAsync();
    }

    public class Data : IData, IAsyncDisposable, IDisposable
    {
        private SqlConnection _dbConnection;
        private SqlTransaction? _dbTransaction;
        private SqlCommand? _dbCommand;
        private bool _inTransaction = false;

        public Data(string connectionString)
        {
            _dbConnection = new SqlConnection(connectionString);
        }

        // public static Data CreateData(string connectionString = "")
        // {
        //     if (!string.IsNullOrEmpty(connectionString))
        //         return new Data(connectionString);

        //     var conn = ConfigurationHelper.GetConfigurationValue("ConnectionStrings:DefaultConnection");
        //     return new Data(conn);
        // }
        public static Data CreateData(string connectionString = "")
        {
            if (!string.IsNullOrWhiteSpace(connectionString))
                return new Data(connectionString);

            var conn = ConfigurationHelper.GetConfigurationValue("ConnectionStrings:DefaultConnection");

            if (string.IsNullOrWhiteSpace(conn))
                conn = Environment.GetEnvironmentVariable("SQLAZURECONNSTR_DefaultConnection");

            if (string.IsNullOrWhiteSpace(conn))
                conn = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

            if (string.IsNullOrWhiteSpace(conn))
                throw new InvalidOperationException("DefaultConnection is missing.");

            return new Data(conn);
        }

        // ------------------- CONNECTION -------------------

        public void Connect()
        {
            if (_dbConnection.State != ConnectionState.Open)
                _dbConnection.Open();
        }

        public async Task ConnectAsync()
        {
            if (_dbConnection.State != ConnectionState.Open)
                await _dbConnection.OpenAsync().ConfigureAwait(false);
        }

        public void Disconnect()
        {
            if (_dbConnection.State != ConnectionState.Closed)
                _dbConnection.Close();
        }

        public bool IsConnected() => _dbConnection.State == ConnectionState.Open;

        // ------------------- TRANSACTION -------------------

        public void BeginTransaction()
        {
            _dbTransaction = _dbConnection.BeginTransaction();
            _inTransaction = true;
        }

        public void Commit()
        {
            _dbTransaction?.Commit();
            _inTransaction = false;
        }

        public void RollBack()
        {
            _dbTransaction?.Rollback();
            _inTransaction = false;
        }

        // ------------------- COMMAND SETUP -------------------

        public void CreateNewStoredProcedure(string store)
        {
            _dbCommand = _dbConnection.CreateCommand();
            _dbCommand.CommandType = CommandType.StoredProcedure;
            _dbCommand.CommandText = store;
            _dbCommand.CommandTimeout = 1800;
            if (_inTransaction)
                _dbCommand.Transaction = _dbTransaction;
        }

        //public void AddParameter(string key, object value)
        //{
        //    if (_dbCommand == null)
        //        throw new InvalidOperationException("Command is not initialized. Call CreateNewStoredProcedure first.");

        //    var parameter = _dbCommand.CreateParameter();
        //    parameter.ParameterName = key;
        //    parameter.Value = value;
        //    _dbCommand.Parameters.Add(parameter);
        //}

        public void AddParameter(string key, object value)
        {
            IDbDataParameter parameter = _dbCommand!.CreateParameter();
            parameter.ParameterName = key;
            parameter.Value = value;
            _dbCommand.Parameters.Add(parameter);
        }

        // ------------------- EXECUTION (ASYNC-FIRST) -------------------

        public async Task<DataTable> ExecStoreToDataTableAsync()
        {
            var dataTable = new DataTable();
            bool localTrans = false;

            try
            {
                if (!_inTransaction)
                {
                    _dbTransaction = _dbConnection.BeginTransaction();
                    localTrans = true;
                }

                _dbCommand!.Transaction = _dbTransaction;

                await using (var reader = await _dbCommand.ExecuteReaderAsync(CommandBehavior.Default).ConfigureAwait(false))
                {
                    dataTable.Load(reader); // vẫn sync
                }

                if (localTrans)
                    _dbTransaction?.Commit();
            }
            catch
            {
                if (localTrans)
                    _dbTransaction?.Rollback();
                throw;
            }
            finally
            {
                _dbCommand?.Parameters.Clear();
                if (localTrans)
                    _dbTransaction?.Dispose();
            }

            return dataTable;
        }

        public async Task ExecNonQueryAsync()
        {
            bool localTrans = false;

            try
            {
                if (!_inTransaction)
                {
                    _dbTransaction = _dbConnection.BeginTransaction();
                    localTrans = true;
                }

                _dbCommand!.Transaction = _dbTransaction;
                await _dbCommand.ExecuteNonQueryAsync().ConfigureAwait(false);

                if (localTrans)
                    _dbTransaction?.Commit();
            }
            catch
            {
                if (localTrans)
                    _dbTransaction?.Rollback();
                throw;
            }
            finally
            {
                _dbCommand?.Parameters.Clear();
                if (localTrans)
                    _dbTransaction?.Dispose();
            }
        }

        public async Task<string> ExecStoreToStringAsync()
        {
            bool localTrans = false;
            string result = "";

            try
            {
                if (!_inTransaction)
                {
                    _dbTransaction = _dbConnection.BeginTransaction();
                    localTrans = true;
                }

                _dbCommand!.Transaction = _dbTransaction;
                var scalar = await _dbCommand.ExecuteScalarAsync().ConfigureAwait(false);
                result = scalar?.ToString() ?? "";

                if (localTrans)
                    _dbTransaction?.Commit();
            }
            catch
            {
                if (localTrans)
                    _dbTransaction?.Rollback();
                throw;
            }
            finally
            {
                _dbCommand?.Parameters.Clear();
                if (localTrans)
                    _dbTransaction?.Dispose();
            }

            return result;
        }

        // ------------------- SYNC WRAPPERS -------------------

        public DataTable ExecStoreToDataTable() =>
            ExecStoreToDataTableAsync().ConfigureAwait(false).GetAwaiter().GetResult();

        public void ExecNonQuery() =>
            ExecNonQueryAsync().ConfigureAwait(false).GetAwaiter().GetResult();

        public string ExecStoreToString() =>
            ExecStoreToStringAsync().ConfigureAwait(false).GetAwaiter().GetResult();

        // ------------------- CLEANUP -------------------

        public void Dispose()
        {
            _dbCommand?.Dispose();
            _dbTransaction?.Dispose();
            _dbConnection.Dispose();
        }

        public async ValueTask DisposeAsync()
        {
            if (_dbCommand != null) await _dbCommand.DisposeAsync();
            if (_dbTransaction != null) await _dbTransaction.DisposeAsync();
            await _dbConnection.DisposeAsync();
        }
    }
}
