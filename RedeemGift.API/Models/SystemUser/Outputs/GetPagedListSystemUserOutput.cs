namespace RedeemGiftAPI.Models.SystemUser.Outputs
{
    public class GetPagedListSystemUserOutput
    {
        public int UserID { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string AvatarImage { get; set; }
        public string UserAvatar { get; set; }
        public string ProjectCodes { get; set; }
        public int RoleID { get; set; }
        public string RoleName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public int Status { get; set; }
        public int TotalRow { get; set; }
    }
}
