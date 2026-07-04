namespace RedeemGiftAPI.Models.Prize.Inputs
{
    public class UpdatePrizeInput
    {
        public int PrizeID { get; set; }
        public string ProjectCode { get; set; }
        public int GiftID { get; set; }
        public float Weight { get; set; }
    }
}
