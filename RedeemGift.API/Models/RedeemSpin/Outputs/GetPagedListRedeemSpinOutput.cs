namespace RedeemGiftAPI.Models.RedeemSpin.Outputs
{
    public class GetPagedListRedeemSpinOutput
    {
        public int RuleID { get; set; }
        public string ProjectCode { get; set; }
        public float BillValuePerSpin { get; set; }
        public float MaxSpinsPerBill { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }
        public int TotalRow { get; set; }
    }
}
