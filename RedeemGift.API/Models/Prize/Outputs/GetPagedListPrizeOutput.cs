namespace RedeemGiftAPI.Models.Prize.Outputs
{
    public class GetPagedListPrizeOutput
    {
        public int PrizeID { get; set; }
        public string ProjectCode { get; set; }
        public int GiftID { get; set; }
        public string PrizeName { get; set; }
        public int Quantity { get; set; }
        public int Weight { get; set; }
        public int RemainingWeight { get; set; }
        public bool IsUnlimited { get; set; }
        public bool IsActive { get; set; }
        public int TotalRow { get; set; }
    }
}
