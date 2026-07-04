
namespace RedeemGiftAPI.Models.Role.Outputs
{
    public class GetListRoleMenuOutput
    {
        public int PermissionID { get; set; }
        public int RoleID { get; set; }
        public int MenuID { get; set; }
        public string MenuName { get; set; }
        public int? ParentId { get; set; }
        public bool IsChecked { get; set; }
    }
}
