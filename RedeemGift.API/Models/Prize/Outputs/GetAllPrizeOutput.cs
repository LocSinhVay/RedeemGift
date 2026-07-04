namespace RedeemGiftAPI.Models.Prize.Outputs
{
    public class GetAllPrizeOutput
    {
        public int PrizeID { get; set; }
        public string PrizeName { get; set; }
        public int? ParentId { get; set; }
        public bool IsChecked { get; set; }
    }
}
