namespace RedeemGiftAPI.Models.SystemUser.Inputs
{
    public class ResetPasswordInput
    {
        public string UserId { get; set; }
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }
}
