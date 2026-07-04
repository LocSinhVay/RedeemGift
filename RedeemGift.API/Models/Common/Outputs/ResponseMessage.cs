namespace RedeemGiftAPI.Models.Common.Outputs
{
    public class ResponseMessage
    {
        public string Status { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }
        public int Code { get; set; }
    }
}
