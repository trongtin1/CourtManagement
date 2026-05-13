using System;
using System.Collections.Generic;
using System.Data;
using System.Dynamic;
using System.Linq;
using System.Reflection;

namespace CourtManagementBE.Infrastructure.Extensions.SqlExtentions
{
    public static partial class ISqlExtensions
    {
        public static List<T> ConvertDataTable<T>(DataTable dt)
        {
            List<T> data = [];
            foreach (DataRow row in dt.Rows)
            {
                T item = GetItem<T>(row);
                data.Add(item);
            }
            return data;
        }

        public static List<dynamic> ToDynamic(DataTable dt)
        {
            var numericTypes = new[] { typeof(Byte), typeof(Decimal), typeof(Double),
                typeof(Int16), typeof(Int32), typeof(Int64), typeof(SByte),
                typeof(Single), typeof(UInt16), typeof(UInt32), typeof(UInt64)};
            var dynamicDt = new List<dynamic>();
            foreach (DataRow row in dt.Rows)
            {
                dynamic dyn = new ExpandoObject();
                dynamicDt.Add(dyn);
                foreach (DataColumn column in dt.Columns)
                {
                    var dic = (IDictionary<string, object>)dyn;
                    var value = row[column];
                    var columnName = System.Text.Json.JsonNamingPolicy.CamelCase.ConvertName(column.ColumnName);
                    if (!Convert.IsDBNull(value))
                    {
                        if (column.DataType == typeof(bool))
                        {
                            dic[columnName] = value.ToString() == "1" || value.ToString() == "True";
                        }
                        else if (column.DataType == typeof(DateTime))
                        {
                            dic[columnName] = DateTime.Parse(value.ToString()!);
                        }
                        else if (numericTypes.Contains(column.DataType))
                        {
                            dic[columnName] = decimal.Parse(value.ToString()!);
                        }
                        else
                        {
                            dic[columnName] = (object)value;
                        }
                    }
                    else
                    {
                        dic[columnName] = null!;
                    }
                }
            }
            return dynamicDt;
        }

        private static T GetItem<T>(DataRow dr)
        {
            Type temp = typeof(T);
            T obj = Activator.CreateInstance<T>();

            foreach (DataColumn column in dr.Table.Columns)
            {
                foreach (PropertyInfo pro in temp.GetProperties())
                {
                    if (pro.Name == column.ColumnName)
                        pro.SetValue(obj, dr.IsNull(column.ColumnName) ? null : dr[column.ColumnName], null);
                    else
                        continue;
                }
            }
            return obj;
        }
    }
}