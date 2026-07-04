namespace RedeemGiftAPI.Models.Gift.Outputs
{
    public class GetPagedListGiftOutput
    {
        public int GiftID { get; set; }
        public string ProjectCode { get; set; }
        public string GiftName { get; set; }
        public float Quantity { get; set; }
        public bool IsUnlimited { get; set; }
        public bool IsActive { get; set; }
        public int TotalRow { get; set; }
    }
}
