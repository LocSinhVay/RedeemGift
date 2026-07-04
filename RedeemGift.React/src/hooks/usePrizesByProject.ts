import { useState, useEffect } from "react";
import { OptionType } from "@/types/common";
import { getPrizesByProject } from "@/controllers/PrizesController";

interface PrizeOption extends OptionType {
  stockQuantity?: number;
  remainingWeight?: number;
}

export const usePrizesByProject = (projectCode: string) => {
  const [prizesByProject, setPrizes] = useState<PrizeOption[]>([]);

  useEffect(() => {
    if (!projectCode) return;

    const fetchPrizes = async () => {
      try {
        const result = await getPrizesByProject(projectCode);
        if (Array.isArray(result?.Data)) {
          const prizeOptions: PrizeOption[] = result.Data.map((item: any) => ({
            value: String(item.GiftID),
            label: item.PrizeName,
            stockQuantity: item.Quantity ?? 0,
            remainingWeight: item.RemainingWeight ?? 0
          }));
          setPrizes(prizeOptions);
        } else {
          setPrizes([]);
        }
      } catch (error) {
        console.error("Lỗi hiển thị giải thưởng:", error);
      }
    };

    fetchPrizes();
  }, [projectCode]);

  return prizesByProject;
};
