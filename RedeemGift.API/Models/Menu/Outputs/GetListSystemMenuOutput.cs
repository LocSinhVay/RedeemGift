namespace RedeemGiftAPI.Models.Menu.Outputs
{
    public class GetListSystemMenuOutput
    {
        public int MenuID { get; set; }
        public string MenuName { get; set; }
        public string MenuPath { get; set; }
        public string Icon { get; set; }
        public int? ParentId { get; set; }
    }
}
