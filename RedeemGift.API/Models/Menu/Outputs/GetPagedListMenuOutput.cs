using RedeemGiftAPI.Models.Common.Outputs;

namespace RedeemGiftAPI.Models.Menu.Outputs
{
    public class GetPagedListMenuOutput : ColumnCommon
    {
        public int MenuID { get; set; }
        public string MenuName { get; set; }
        public string MenuPath { get; set; }
        public string Icon { get; set; }
        public int? ParentId { get; set; }
        public string MenuParentName { get; set; }
        public int Status { get; set; }
        public string StatusName { get; set; }
        public int? DisplayOrder { get; set; }
        public int TotalRow { get; set; }
    }
}
