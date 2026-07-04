namespace RedeemGiftAPI.Models.Role.Inputs
{
    public class InsertRoleInput
    {
        public string RoleName { get; set; }
        public string Symbol { get; set; }
        public int Status { get; set; }
        public List<InsertRoleMenuInput> listRoleMenu { get; set; }
    }
}
