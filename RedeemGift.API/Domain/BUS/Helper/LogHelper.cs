using Newtonsoft.Json;
using System.Text;

namespace RedeemGiftAPI.Domain.BUS.Helper
{
    public class LogHelper
    {
        private static readonly HttpClient client = new HttpClient();

        public static async Task InsertLog(string title, string content, string source, string userLogin, object parameter)
        {
            var logData = new
            {
                title = title,
                content = content,
                source = source,
                userlogin = userLogin,
                parameter = JsonConvert.SerializeObject(parameter)
            };

            var jsonContent = new StringContent(JsonConvert.SerializeObject(logData), Encoding.UTF8, "application/json");

            // Thêm header API key
            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Add("accept", "*/*");
            client.DefaultRequestHeaders.Add("_keyAPI", "Ppl@123#@!");

            try
            {
                // Gọi API đồng bộ
                var response = await client.PostAsync("https://log.peoplelinkvietnam.com/api/log/insert", jsonContent);

                if (!response.IsSuccessStatusCode)
                {
                    // Xử lý khi API trả về lỗi
                    Console.WriteLine("Error calling log API: " + response.StatusCode);
                }
            }
            catch (Exception ex)
            {
                // Xử lý khi có lỗi khi gọi API
                Console.WriteLine("Exception when calling log API: " + ex.Message);
            }
        }
    }
}
