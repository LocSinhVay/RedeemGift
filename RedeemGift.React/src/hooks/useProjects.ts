import { useState, useEffect, useMemo } from "react";
import { OptionType } from "@/types/common";
import { getAllProject } from "@/controllers/ProjectController";
import { useAuth } from "@/contexts/AuthContext";

export const useProjects = (trigger: boolean) => {
  const [projects, setProjects] = useState<OptionType[]>([]);
  const { auth } = useAuth();

  useEffect(() => {
    if (!trigger) return;

    const fetchProjects = async () => {
      try {
        const result = await getAllProject();
        if (Array.isArray(result?.Data)) {
          const projectOptions = result.Data.map((item: any) => ({
            value: item.ProjectCode,
            label: item.ProjectName,
          }));
          setProjects(projectOptions);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách dự án:", error);
        setProjects([]);
      }
    };

    fetchProjects();
  }, [trigger]);

  // 🔹 Các dự án mà user được phân quyền (từ auth.ProjectCodes)
  const visibleProjects = useMemo(() => {
    if (!auth) return [];

    // Trường hợp user có quyền xem tất cả
    if (!auth.ProjectCodes || auth.ProjectCodes.length === 0) {
      return projects;
    }

    // Nếu ProjectCodes là string → tách ra thành mảng
    const allowed =
      Array.isArray(auth.ProjectCodes)
        ? auth.ProjectCodes
        : auth.ProjectCodes.split(",").map((x: string) => x.trim());

    return projects.filter((p) => allowed.includes(p.value));
  }, [auth, projects]);

  // 🔹 Dự án hiện tại (ProjectCode)
  const defaultProject = useMemo(() => {
    if (auth?.SelectedProject) {
      return visibleProjects.find((p) => p.value === auth.SelectedProject) || null;
    }
    return null;
  }, [auth, visibleProjects]);

  // 🔹 Có phải user có toàn quyền (tức là xem được tất cả dự án)
  const isAll = !auth?.ProjectCodes || auth.ProjectCodes.length === 0;

  return {
    projects,          // tất cả dự án
    visibleProjects,   // các dự án user được phép xem
    defaultProject,    // dự án đang được chọn
    isAll,             // true nếu user được phép xem tất cả
  };
};
