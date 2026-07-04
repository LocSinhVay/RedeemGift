namespace RedeemGiftAPI.Models.Gift.Inputs
{
    public class UpdateGiftInput
    {
        public int GiftID { get; set; }
        public string ProjectCode { get; set; }
        public string GiftName { get; set; }
        public float Quantity { get; set; }
        public bool IsUnlimited { get; set; }
    }
}
