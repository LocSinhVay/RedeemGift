namespace RedeemGiftAPI.Models.Project.Outputs
{
    public class GetPagedListProductOutput
    {
        public int ProjectID { get; set; }
        public string ProjectCode { get; set; }
        public string ProjectName { get; set; }
        public bool IsActive { get; set; }
        public int TotalRow { get; set; }
    }
}
