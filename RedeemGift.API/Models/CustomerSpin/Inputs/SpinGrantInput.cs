namespace RedeemGiftAPI.Models.CustomerSpin.Inputs
{
    public class SpinGrantInput
    {
        public string ProjectCode { get; set; }
        public int RuleID { get; set; }
        public float BillValue { get; set; }
        public string ImagePath { get; set; }
        public int SpinsGranted { get; set; }
        public IFormFile File { get; set; }
    }
}
