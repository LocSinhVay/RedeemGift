namespace RedeemGiftAPI.Models.EmailConfig.Outputs
{
    public class GetPagedListEmailConfigOutput
    {
        public int EmailId { get; set; }
        public string Type { get; set; }
        public string SmtpServer { get; set; }
        public int? SmtpPort { get; set; }
        public string SenderEmail { get; set; }
        public string SenderPassword { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string RedirectUri { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public int IsActive { get; set; }
        public int TotalRow { get; set; }
    }
}
