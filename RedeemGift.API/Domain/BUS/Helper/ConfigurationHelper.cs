namespace RedeemGiftAPI.Domain.BUS.Helper
{
    public static class ConfigurationHelper
    {
        private static IConfigurationRoot _configuration;
        static ConfigurationHelper()
        {
            _configuration = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();
        }

        public static string GetConfigurationValue(string key)
        {
            return _configuration[key];
        }
    }
}
