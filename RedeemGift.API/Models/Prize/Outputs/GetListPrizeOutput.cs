namespace RedeemGiftAPI.Models.Prize.Outputs
{
    public class GetListPrizeOutput
    {
        public int GiftID { get; set; }
        public string PrizeName { get; set; }
        public int Quantity { get; set; }
        public int RemainingWeight { get; set; }
    }
}
