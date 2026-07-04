namespace RedeemGiftAPI.Models.SystemUser.Outputs
{
    public class GetListSystemUserProjectAssignOutput
    {
        public int ProjectID { get; set; }
        public string ProjectName { get; set; }
        public int UserID { get; set; }
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string UserAvatar { get; set; }
        public int RoleID { get; set; }
        public string RoleName { get; set; }
    }
}
