namespace RedeemGiftAPI.Models.Menu.Outputs
{
    public class GetAllMenuOutput
    {
        public int MenuID { get; set; }
        public string MenuName { get; set; }
        public int? ParentId { get; set; }
        public bool IsChecked { get; set; }
    }
}
