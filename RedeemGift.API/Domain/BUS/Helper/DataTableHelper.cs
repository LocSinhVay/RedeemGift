using RedeemGiftAPI.Models.Common.Outputs;
using OfficeOpenXml;
using System.Data;
using System.Reflection;
using System.Text;

namespace RedeemGiftAPI.Domain.BUS.Helper
{
    public static class DataTableHelper
    {
        private static readonly Dictionary<Type, Func<object, object>> Converters = new()
        {
            { typeof(int), value => Convert.ToInt32(value) },
            { typeof(int?), value => value == null ? (int?)null : Convert.ToInt32(value) },
            { typeof(long), value => Convert.ToInt64(value) },
            { typeof(long?), value => value == null ? (long?)null : Convert.ToInt64(value) },
            { typeof(double), value => Convert.ToDouble(value) },
            { typeof(double?), value => value == null ? (double?)null : Convert.ToDouble(value) },
            { typeof(float), value => Convert.ToSingle(value) },
            { typeof(float?), value => value == null ? (float?)null : Convert.ToSingle(value) },
            { typeof(DateTime), value => DateTime.Parse(value.ToString()) },
            { typeof(DateTime?), value => value == null ? (DateTime?)null : DateTime.Parse(value.ToString()) },
            { typeof(DateOnly), value => DateOnly.Parse(value.ToString()) },
            { typeof(DateOnly?), value => value == null ? (DateOnly?)null : DateOnly.Parse(value.ToString()) },
            // Add more types as needed
        };

        public static List<T> DataTableToList<T>(this DataTable table) where T : class, new()
        {
            try
            {
                List<T> list = new List<T>();
                foreach (DataRow item2 in table.AsEnumerable())
                {
                    T item = GetItem<T>(item2);
                    list.Add(item);
                }

                return list;
            }
            catch (Exception objEx)
            {
                Console.WriteLine(objEx.Message);
                return null;
            }
        }

        public static T DataTableToObject<T>(this DataTable table) where T : class, new()
        {
            try
            {
                using (IEnumerator<DataRow> enumerator = table.AsEnumerable().GetEnumerator())
                {
                    if (enumerator.MoveNext())
                    {
                        DataRow current = enumerator.Current;
                        return GetItem<T>(current);
                    }
                }
                return null;
            }
            catch (Exception objEx)
            {
                string message = objEx.Message;
                return null;
            }
        }

        public static DataTable ListToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);
            //Get all the properties
            PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in Props)
            {
                //Setting column names as Property names
                dataTable.Columns.Add(prop.Name);
            }
            foreach (T item in items)
            {
                var values = new object[Props.Length];
                for (int i = 0; i < Props.Length; i++)
                {
                    //inserting property values to datatable rows
                    values[i] = Props[i].GetValue(item, null);
                }
                dataTable.Rows.Add(values);
            }
            //put a breakpoint here and check datatable
            return dataTable;
        }

        private static DataTable ExcelToDataTable(ExcelWorksheet worksheet, ref ResponseMessage message)
        {
            var table = new DataTable();
            int noOfCol = worksheet.Dimension.End.Column;
            int noOfRow = worksheet.Dimension.End.Row;
            int row = 0, col = 0;

            try
            {
                for (col = 1; col <= noOfCol; col++)
                {
                    var colName = worksheet.Cells[1, col].Value?.ToString() ?? $"Column{col}";
                    table.Columns.Add(colName, typeof(string));
                }

                for (row = 2; row <= noOfRow; row++)
                {
                    var values = new object[noOfCol];
                    for (col = 1; col <= noOfCol; col++)
                    {
                        values[col - 1] = worksheet.Cells[row, col].Value;
                    }
                    table.Rows.Add(values);
                }
                message.Message = string.Empty;
                message.Status = MessageStatus.Success;
                return table;
            }
            catch
            {
                message.Message = $"Lỗi kiểu dữ liệu dòng thứ {row}, cột {col}";
                message.Status = MessageStatus.Error;
                return null;
            }
        }

        //private static T GetItem<T>(DataRow dr)
        //{
        //    T obj = Activator.CreateInstance<T>();
        //    Type temp = typeof(T);

        //    foreach (DataColumn column in dr.Table.Columns)
        //    {
        //        var property = temp.GetProperty(column.ColumnName);

        //        if (property != null)
        //        {
        //            if (Convert.IsDBNull(dr[column.ColumnName]))
        //            {
        //                // Handle null or default values
        //                if (property.PropertyType == typeof(string))
        //                {
        //                    property.SetValue(obj, "");
        //                }
        //                else if (property.PropertyType.IsGenericType && property.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>))
        //                {
        //                    property.SetValue(obj, null);
        //                }
        //                else
        //                {
        //                    // Handle other non-nullable types
        //                    property.SetValue(obj, Activator.CreateInstance(property.PropertyType));
        //                }
        //            }
        //            else
        //            {
        //                // Handle type conversions
        //                if (Converters.TryGetValue(property.PropertyType, out var converter))
        //                {
        //                    property.SetValue(obj, converter(dr[column.ColumnName]));
        //                }
        //                else
        //                {
        //                    // For nullable types, get the underlying type for conversion
        //                    var targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
        //                    property.SetValue(obj, Convert.ChangeType(dr[column.ColumnName], targetType));
        //                }
        //            }
        //        }
        //    }
        //    return obj;
        //}

        private static T GetItem<T>(DataRow dr)
        {
            T obj = Activator.CreateInstance<T>();
            Type temp = typeof(T);

            foreach (DataColumn column in dr.Table.Columns)
            {
                var property = temp.GetProperty(column.ColumnName);
                if (property == null) continue;

                object value = dr[column.ColumnName];

                if (Convert.IsDBNull(value))
                {
                    // Handle null or default values
                    if (property.PropertyType == typeof(string))
                    {
                        property.SetValue(obj, "");
                    }
                    else if (property.PropertyType.IsGenericType &&
                             property.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>))
                    {
                        property.SetValue(obj, null);
                    }
                    else
                    {
                        property.SetValue(obj, Activator.CreateInstance(property.PropertyType));
                    }
                }
                else
                {
                    // Special handling: SQL Server TIME => TimeSpan => string
                    if (property.PropertyType == typeof(string) && value is TimeSpan ts)
                    {
                        property.SetValue(obj, ts.ToString(@"hh\:mm\:ss"));
                    }
                    else
                    {
                        var targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
                        property.SetValue(obj, Convert.ChangeType(value, targetType));
                    }
                }
            }

            return obj;
        }


        public static string DataTableToJSONWithStringBuilder(DataTable table)
        {
            var JSONString = new StringBuilder();
            if (table.Rows.Count > 0)
            {
                for (int i = 0; i < table.Rows.Count; i++)
                {
                    JSONString.Append("{");
                    for (int j = 0; j < table.Columns.Count; j++)
                    {
                        if (j < table.Columns.Count - 1)
                        {
                            JSONString.Append("\"" + table.Columns[j].ColumnName.ToString() + "\":" + "\"" + table.Rows[i][j].ToString() + "\",");
                        }
                        else if (j == table.Columns.Count - 1)
                        {
                            JSONString.Append("\"" + table.Columns[j].ColumnName.ToString() + "\":" + "\"" + table.Rows[i][j].ToString() + "\"");
                        }
                    }
                    if (i == table.Rows.Count - 1)
                    {
                        JSONString.Append("}");
                    }
                    else
                    {
                        JSONString.Append("},");
                    }
                }
            }
            return JSONString.ToString();
        }
    }
}
