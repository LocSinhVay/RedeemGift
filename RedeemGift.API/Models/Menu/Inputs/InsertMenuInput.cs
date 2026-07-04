namespace RedeemGiftAPI.Models.Menu.Inputs
{
    public class InsertMenuInput
    {
        public string MenuName { get; set; }
        public string MenuPath { get; set; }
        public string Icon { get; set; }
        public int? ParentId { get; set; }
        public int Status { get; set; }
        public int? DisplayOrder { get; set; }
    }
}
