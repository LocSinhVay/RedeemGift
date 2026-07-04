using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using RedeemGiftAPI.Domain.BUS.Menu;
using RedeemGiftAPI.Domain.BUS.SystemUser;
using RedeemGiftAPI.Models.Common.Outputs;
using RedeemGiftAPI.Models.SystemUser.Inputs;
using RedeemGiftAPI.Models.SystemUser.Outputs;
using RedeemGiftAPI.Services.Email;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Web;

namespace RedeemGiftAPI.Controllers.Login
{
    [ApiController]
    [Route("api/login/[action]")]
    public class LoginController : Controller
    {
        private readonly IMenuBUS _menuBUS;
        private readonly ISystemUserBUS _systemUserBUS;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private ResponseMessage _apiResponseMessage = new ResponseMessage();

        public LoginController(
            ISystemUserBUS systemUserBUS,
            IMenuBUS menuBUS,
            IEmailService emailService,
            IConfiguration configuration,
            IWebHostEnvironment hostingEnvironment,
            IHttpContextAccessor httpContextAccessor)
        {
            _menuBUS = menuBUS;
            _systemUserBUS = systemUserBUS;
            _emailService = emailService;
            _configuration = configuration;
            _hostingEnvironment = hostingEnvironment;
            _apiResponseMessage.Status = MessageStatus.Success;
            _apiResponseMessage.Message = string.Empty;
        }

        [HttpPost]
        public IActionResult Login(LoginSystemUserInput bo)
        {
            LoginSystemUserOutput result = _systemUserBUS.Login(bo);
            _apiResponseMessage = _systemUserBUS.GetResponseMessage();

            if (_apiResponseMessage.Status != MessageStatus.Success)
            {
                _apiResponseMessage.Data = null;
            }
            else
            {
                result.Menu = _menuBUS.GetMenu(result.RoleID);
                result.Token = GenerateJwtToken(result.Username);
                _apiResponseMessage.Data = result;
            }

            return Ok(_apiResponseMessage);
        }

        private string GenerateJwtToken(string username)
        {
            var secretKey = _configuration["AppSettings:SecretKey"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Đọc thời hạn token từ config, mặc định 1 ngày nếu không có
            int expiryDays = _configuration.GetValue<int>("AppSettings:TokenExpiryDays", 1);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                //expires: DateTime.UtcNow.AddSeconds(30),
                // Hết hạn vào cuối ngày thứ N (vd: 7 ngày nữa là 23:59:59)
                expires: DateTime.UtcNow.AddDays(expiryDays + 1).AddTicks(-1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost]
        public async Task<IActionResult> SendRequest(SendRequestResetInput bo)
        {
            var userInfo = _systemUserBUS.GetUserFromEmail(bo);
            _apiResponseMessage = _systemUserBUS.GetResponseMessage();

            if (userInfo != null)
            {
                var emailConfig = _systemUserBUS.GetEmailConfig();
                if (emailConfig == null)
                    return Ok(_systemUserBUS.GetResponseMessage());

                var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray().Concat(Encoding.UTF8.GetBytes(userInfo.Username)).ToArray());
                var host = _configuration["AppSettings:HostingEnvironment"];
                var url = $"{host}/recoveryPassword?userId={userInfo.UserID}&token={HttpUtility.UrlEncode(token)}";

                var templatePath = Path.Combine(_hostingEnvironment.WebRootPath, "Templates", "MailResetPass.html");
                var body = await System.IO.File.ReadAllTextAsync(templatePath);
                body = body.Replace("{name}", userInfo.FullName).Replace("{url}", url);

                var mailInput = new SendMailInput
                {
                    EmailConfiguration = emailConfig,
                    UserInfoFromEmail = userInfo,
                    MailSubject = "[RedeemGift] - Yêu cầu khôi phục mật khẩu",
                    MailBody = body
                };

                var emailResponse = await _emailService.SendEmailAsync(mailInput, token);

                if (emailResponse.Status == MessageStatus.Error)
                {
                    _apiResponseMessage.Status = MessageStatus.Error;
                    _apiResponseMessage.Message = emailResponse.Message;
                }
            }

            return Ok(_apiResponseMessage);
        }

        [HttpPost]
        public IActionResult RecoveryPassword(ResetPasswordInput bo)
        {
            if (!int.TryParse(bo.UserId, out var parsedUserId))
            {
                _apiResponseMessage.Status = MessageStatus.Warning;
                _apiResponseMessage.Message = "UserId không hợp lệ.";
                return Ok(_apiResponseMessage);
            }

            var storedToken = _systemUserBUS.GetTokenEmail(parsedUserId);
            var decodedToken = HttpUtility.UrlDecode(bo.Token)?.Replace(" ", "+");

            if (storedToken == null || storedToken.Token != decodedToken)
            {
                _apiResponseMessage.Status = MessageStatus.Warning;
                _apiResponseMessage.Message = "Token không hợp lệ.";
            }
            else if (storedToken.IsUsed)
            {
                _apiResponseMessage.Status = MessageStatus.Warning;
                _apiResponseMessage.Message = "Token đã được sử dụng.";
            }
            else if (DateTime.UtcNow.ToLocalTime() > storedToken.ExpiryTime)
            {
                _apiResponseMessage.Status = MessageStatus.Warning;
                _apiResponseMessage.Message = "Token đã hết hạn. Vui lòng gửi lại yêu cầu.";
            }
            else
            {
                var result = _systemUserBUS.ResetPassword(parsedUserId, bo.NewPassword, storedToken.Username);
                _apiResponseMessage = _systemUserBUS.GetResponseMessage();

                if (result != -1)
                {
                    _systemUserBUS.MarkTokenAsUsed(storedToken.Id);
                }
            }

            return Ok(_apiResponseMessage);
        }
    }
}

