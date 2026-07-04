namespace RedeemGiftAPI.Models.CustomerSpin.Outputs
{
    public class GetDetailSpinInfoOutput
    {
        public Guid SpinGrantID { get; set; }
        public int PrizeID { get; set; }
        public string PrizeName { get; set; }
        public int SpinsGranted { get; set; }
        public int Weight { get; set; }
    }
}
