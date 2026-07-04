namespace RedeemGiftAPI.Models.AccountType.Outputs
{
    public class GetPagedListAccountTypeOutput
    {
        public int AccountTypeID { get; set; }
        public string AccountTypeName { get; set; }
        public int IsActive { get; set; }
        public int TotalRow { get; set; }
    }
}
