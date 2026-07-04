
namespace RedeemGiftAPI.Models.Role.Inputs
{
    public class InsertRoleMenuInput
    {
        public int RoleID { get; set; }
        public int MenuID { get; set; }
        public bool? IsChecked { get; set; }
    }
}
