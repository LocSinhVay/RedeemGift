namespace RedeemGiftAPI.Models.SystemUser.Inputs
{
    public class UpdatePasswordSystemUserInput
    {
        public int UserID { get; set; }
        public string Password { get; set; }
        public string NewPassword { get; set; }
        public string ConfirmNewPassword { get; set; }
        public bool IsReset { get; set; } = true;
    }
}
