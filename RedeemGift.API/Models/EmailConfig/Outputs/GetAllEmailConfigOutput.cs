namespace RedeemGiftAPI.Models.EmailConfig.Outputs
{
    public class GetAllEmailConfigOutput
    {
        public int EmailId { get; set; }
        public string SenderEmail { get; set; }
        public bool IsActive { get; set; }
    }
}
