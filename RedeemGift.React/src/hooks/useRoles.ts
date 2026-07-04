import { useState, useEffect } from "react";
import { getAllRole } from "@/controllers/UserSystemController";
import { RoleOption } from "@/types/common";

export const useRoles = (trigger: boolean) => {
  const [role, setRole] = useState<RoleOption[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const fetchRoles = async () => {
      try {
        const result = await getAllRole();
        if (Array.isArray(result?.Data)) {
          const roleOptions: RoleOption[] = result.Data.map((item: any) => ({
            value: String(item.RoleID),
            label: item.RoleName,
            symbol: item.Symbol,
          }));
          setRole(roleOptions);
        }
      } catch (error) {
        console.error("Lỗi hiển thị quyền:", error);
      }
    };

    fetchRoles();
  }, [trigger]);

  return role;
};
