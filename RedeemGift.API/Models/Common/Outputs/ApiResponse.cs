namespace RedeemGiftAPI.Models.Common.Outputs
{
    public class ApiResponse<T> : ResponseMessage
    {
        public new T Data { get; set; }
    }
}
