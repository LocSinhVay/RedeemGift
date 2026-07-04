namespace RedeemGiftAPI.Models.SystemUser.Inputs
{
    public class SendMailInput
    {
        // Email subject and body
        public string MailSubject { get; set; }
        public string MailBody { get; set; }

        // Recipient information
        public List<string> MailToInfos { get; set; } = new List<string>();
        public List<string> MailCCInfos { get; set; } = new List<string>();

        // UserInfo request reset password
        public UserInfoFromEmail UserInfoFromEmail { get; set; }

        // EmailConfiguration
        public EmailConfiguration EmailConfiguration { get; set; }

        // TokenEmailInfo from table EmailLogs
        public TokenEmailInfo TokenEmailInfo { get; set; }

        // Attachments
        public List<Attachment> Attachments { get; set; } = new List<Attachment>();
    }

    public class EmailConfiguration
    {
        public int Id { get; set; }
        public string Type { get; set; }
        public string SmtpServer { get; set; }
        public int? SmtpPort { get; set; }
        public bool? UseSsl { get; set; }
        public string SenderEmail { get; set; }
        public string SenderPassword { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string RedirectUri { get; set; }
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public bool IsActive { get; set; }
    }

    public class UserInfoFromEmail
    {
        public int UserID { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
    }

    public class TokenEmailInfo
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Token { get; set; }
        public DateTime ExpiryTime { get; set; }
        public bool IsUsed { get; set; }
    }

    public class Attachment
    {
        public byte[] FileBytes { get; set; }
        public string FileName { get; set; }
    }
}
