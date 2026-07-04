namespace RedeemGiftAPI.Models.Role.Inputs
{
    public class UpdateRoleInput
    {
        public int RoleID { get; set; }
        public string RoleName { get; set; }
        public string Symbol { get; set; }
        public int Status { get; set; }
        public List<InsertRoleMenuInput> listRoleMenu { get; set; }
    }
}
