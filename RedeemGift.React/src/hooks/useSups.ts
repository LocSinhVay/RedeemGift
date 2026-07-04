import { useState, useEffect } from "react";
import { OptionType } from "@/types/common";
import { getListSup } from "@/controllers/UserSystemController";

export const useSups = (trigger: boolean) => {
  const [sup, setSup] = useState<OptionType[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const fetchSups = async () => {
      try {
        const result = await getListSup();
        if (Array.isArray(result?.Data)) {
          const supOptions: OptionType[] = result.Data.map((item: any) => ({
            value: item.SupCode,
            label: item.SupName
          }));
          setSup(supOptions);
        }
      } catch (error) {
        console.error("Lỗi hiển thị SUP:", error);
      }
    };

    fetchSups();
  }, [trigger]);

  return sup;
};
