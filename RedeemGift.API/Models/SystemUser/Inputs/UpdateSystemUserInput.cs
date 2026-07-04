namespace RedeemGiftAPI.Models.SystemUser.Inputs
{
    public class UpdateSystemUserInput
    {
        public int UserID { get; set; }
        public string ProjectCodes { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string UserAvatar { get; set; }
        public string RoleID { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public int Status { get; set; }
        public IFormFile File { get; set; }
    }
}
