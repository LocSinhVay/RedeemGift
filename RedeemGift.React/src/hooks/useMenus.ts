import { useState, useEffect } from "react";
import { getAllMenu } from "@/controllers/MenuController";

type MenuOption = { value: string; label: string };

export const useMenus = (trigger: boolean) => {
  const [menu, setMenu] = useState<MenuOption[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const fetchMenus = async () => {
      try {
        const result = await getAllMenu();
        if (Array.isArray(result?.Data)) {
          const menuOptions: MenuOption[] = result.Data.map((item: any) => ({
            value: String(item.MenuID),
            label: item.MenuName
          }));
          setMenu(menuOptions);
        }
      } catch (error) {
        console.error("Lỗi hiển thị Menu:", error);
      }
    };

    fetchMenus();
  }, [trigger]);

  return menu;
};
