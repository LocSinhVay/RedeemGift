namespace RedeemGiftAPI.Models.RedeemSpin.Outputs
{
    public class GetlistRedemptionRuleOutput
    {
        public int RuleID { get; set; }
        public string ProjectCode { get; set; }
        public float BillValuePerSpin { get; set; }
        public float MaxSpinsPerBill { get; set; }
    }
}
