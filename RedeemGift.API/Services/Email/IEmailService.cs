// Services/Email/IEmailService.cs
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.SystemUser.Inputs;
using Google.Apis.Gmail.v1;

namespace RedeemGiftAPI.Services.Email
{
    public interface IEmailService
    {
        Task<ResponseMessage> SendEmailAsync(SendMailInput emailInfo, string token = null);
        Task SendEmailViaSMTP(SendMailInput emailInfo);
        Task SendEmailViaGmailApi(SendMailInput emailInfo, GmailService service);
    }
}