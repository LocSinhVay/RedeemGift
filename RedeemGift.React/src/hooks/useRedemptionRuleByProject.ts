import { useState, useEffect } from "react";
import { RedemptionRule } from "@/types/common";
import { getListRedemptionRuleByProject } from "@/controllers/RedeemSpinController";

export const useRedemptionRuleByProject = (projectCode: string) => {
  const [redemptionRuleByProject, setRedemptionRuleByProject] = useState<RedemptionRule[]>([]);

  useEffect(() => {
    if (!projectCode) {
      setRedemptionRuleByProject([]);
      return;
    }

    const fetchRedemptionRule = async () => {
      try {
        const result = await getListRedemptionRuleByProject(projectCode);
        if (result?.Data) {
          // Nếu Data là mảng
          if (Array.isArray(result.Data)) {
            const mappedRules: RedemptionRule[] = result.Data.map((item: any) => ({
              ruleID: item.RuleID,
              projectCode: item.ProjectCode,
              billValuePerSpin: item.BillValuePerSpin ?? 0,
              maxSpinsPerBill: item.MaxSpinsPerBill ?? 0,
            }));
            setRedemptionRuleByProject(mappedRules);
          } else {
            // Nếu Data chỉ là 1 object
            const singleRule: RedemptionRule = {
              ruleID: result.Data.RuleID,
              projectCode: result.Data.ProjectCode,
              billValuePerSpin: result.Data.BillValuePerSpin ?? 0,
              maxSpinsPerBill: result.Data.MaxSpinsPerBill ?? 0,
            };
            setRedemptionRuleByProject([singleRule]);
          }
        } else {
          setRedemptionRuleByProject([]);
        }
      } catch (error) {
        console.error("Lỗi hiển thị chi tiết tỷ trọng quy đổi:", error);
        setRedemptionRuleByProject([]);
      }
    };

    fetchRedemptionRule();
  }, [projectCode]);

  return redemptionRuleByProject;
};
