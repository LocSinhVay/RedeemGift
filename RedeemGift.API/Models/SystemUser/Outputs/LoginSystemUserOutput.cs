using RedeemGiftAPI.Models.Menu.Outputs;

namespace RedeemGiftAPI.Models.SystemUser.Outputs
{
    public class LoginSystemUserOutput
    {
        public int UserID { get; set; }
        public string Password { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string AvatarImage { get; set; }
        public string UserAvatar { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool StatusUser { get; set; }
        public bool StatusRole { get; set; }
        public string StatusName { get; set; }
        public string ProjectCodes { get; set; }
        public int RoleID { get; set; }
        public string RoleName { get; set; }
        public string Token { get; set; }
        public List<GetListSystemMenuOutput> Menu { get; set; }
    }
}
