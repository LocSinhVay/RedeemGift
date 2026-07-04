// Services/Email/EmailService.cs
using RedeemGiftAPI.Domain.BUS.SystemUser;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.SystemUser.Inputs;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Gmail.v1;
using Google.Apis.Gmail.v1.Data;
using Google.Apis.Services;
using MimeKit;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace RedeemGiftAPI.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly ISystemUserBUS _systemUserBUS;

        public EmailService(ISystemUserBUS systemUserBUS)
        {
            _systemUserBUS = systemUserBUS;
        }

        public async Task<ResponseMessage> SendEmailAsync(SendMailInput emailInfo, string token = null)
        {
            var response = new ResponseMessage();
            try
            {
                if (emailInfo.EmailConfiguration.Type == "SMTP")
                {
                    await SendEmailViaSMTP(emailInfo);
                }
                else if (emailInfo.EmailConfiguration.Type == "GMAIL")
                {
                    var tokenResponse = new TokenResponse
                    {
                        AccessToken = emailInfo.EmailConfiguration.Token,
                        RefreshToken = emailInfo.EmailConfiguration.RefreshToken,
                        TokenType = "Bearer"
                    };

                    var flow = new GoogleAuthorizationCodeFlow(new GoogleAuthorizationCodeFlow.Initializer
                    {
                        ClientSecrets = new ClientSecrets
                        {
                            ClientId = emailInfo.EmailConfiguration.ClientId,
                            ClientSecret = emailInfo.EmailConfiguration.ClientSecret
                        }
                    });

                    var credential = new UserCredential(flow, "user", tokenResponse);
                    if (credential.Token.IsStale)
                        await credential.RefreshTokenAsync(CancellationToken.None);

                    var service = new GmailService(new BaseClientService.Initializer
                    {
                        HttpClientInitializer = credential,
                        ApplicationName = "GmailAPI"
                    });

                    await SendEmailViaGmailApi(emailInfo, service);
                }

                // Log
                _systemUserBUS.SaveEmailLog(
                    emailInfo.EmailConfiguration.Id,
                    emailInfo.UserInfoFromEmail.UserID,
                    emailInfo.UserInfoFromEmail.Username,
                    emailInfo.EmailConfiguration.SenderEmail,
                    emailInfo.UserInfoFromEmail.Email,
                    emailInfo.MailSubject,
                    "sent",
                    null,
                    token
                );
            }
            catch (Exception ex)
            {
                _systemUserBUS.SaveEmailLog(
                    emailInfo.EmailConfiguration.Id,
                    emailInfo.UserInfoFromEmail.UserID,
                    emailInfo.UserInfoFromEmail.Username,
                    emailInfo.EmailConfiguration.SenderEmail,
                    emailInfo.UserInfoFromEmail.Email,
                    emailInfo.MailSubject,
                    "failed",
                    ex.Message,
                    token
                );
                response.Status = MessageStatus.Error;
                response.Message = ex.Message;
            }

            return response;
        }

        public async Task SendEmailViaSMTP(SendMailInput bo)
        {
            var smtp = bo.EmailConfiguration;
            using var client = new SmtpClient(smtp.SmtpServer, (int)smtp.SmtpPort)
            {
                Credentials = new NetworkCredential(smtp.SenderEmail, smtp.SenderPassword),
                EnableSsl = true
            };

            var mail = new MailMessage
            {
                From = new MailAddress(smtp.SenderEmail),
                Subject = bo.MailSubject,
                Body = bo.MailBody,
                IsBodyHtml = true,
                BodyEncoding = Encoding.UTF8
            };

            mail.To.Add(bo.UserInfoFromEmail.Email);
            bo.MailToInfos?.ForEach(to => mail.To.Add(to));
            bo.MailCCInfos?.ForEach(cc => mail.CC.Add(cc));

            if (bo.Attachments != null)
            {
                foreach (var file in bo.Attachments)
                {
                    var stream = new MemoryStream(file.FileBytes);
                    mail.Attachments.Add(new System.Net.Mail.Attachment(stream, file.FileName));
                }
            }

            await client.SendMailAsync(mail);
        }

        public async Task SendEmailViaGmailApi(SendMailInput bo, GmailService service)
        {
            var msg = new MimeMessage();
            msg.From.Add(new MailboxAddress("", bo.EmailConfiguration.SenderEmail));
            msg.To.Add(new MailboxAddress("", bo.UserInfoFromEmail.Email));
            bo.MailToInfos?.ForEach(to => msg.To.Add(new MailboxAddress("", to)));
            bo.MailCCInfos?.ForEach(cc => msg.Cc.Add(new MailboxAddress("", cc)));
            msg.Subject = bo.MailSubject;

            var builder = new BodyBuilder { HtmlBody = bo.MailBody };
            if (bo.Attachments != null)
            {
                foreach (var att in bo.Attachments)
                    builder.Attachments.Add(att.FileName, att.FileBytes);
            }
            msg.Body = builder.ToMessageBody();

            using var stream = new MemoryStream();
            await msg.WriteToAsync(stream);
            var rawMessage = Convert.ToBase64String(stream.ToArray())
                .Replace("+", "-").Replace("/", "_").Replace("=", "");

            await service.Users.Messages.Send(new Message { Raw = rawMessage }, "me").ExecuteAsync();
        }
    }
}