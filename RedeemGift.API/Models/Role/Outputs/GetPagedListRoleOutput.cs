namespace RedeemGiftAPI.Models.Role.Outputs
{
    public class GetPagedListRoleOutput
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; }
        public string Symbol { get; set; }
        public int Status { get; set; }
        public int TotalRow { get; set; }
        public List<GetListRoleMenuOutput> listRoleMenu { get; set; }
    }
}
