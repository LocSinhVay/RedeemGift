namespace RedeemGiftAPI.Models.RedeemSpin.Inputs
{
    public class UpdateRedeemSpinInput
    {
        public int RuleID { get; set; }
        public string ProjectCode { get; set; }
        public float BillValuePerSpin { get; set; }
        public float MaxSpinsPerBill { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
