namespace RedeemGiftAPI.Models.CustomerSpin.Outputs
{
    public class GetPagedListCustomerSpinOutput
    {
        public Guid QRCode { get; set; }
        public string CustomerName { get; set; }
        public string PhoneNumber { get; set; }
        public string ProjectCode { get; set; }
        public string BillImagePath { get; set; }
        public int SpinsGranted { get; set; }
        public int SpinsUsed { get; set; }
        public float BillValue { get; set; }
        public int TotalRow { get; set; }
    }
}
