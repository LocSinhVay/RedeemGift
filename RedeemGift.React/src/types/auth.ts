// Auth Types - Giữ nguyên từ code gốc

export interface MenuItem {
  MenuID: number;
  MenuName: string;
  MenuPath: string;
  Icon?: string;
  ParentId?: number | null;
  Children?: MenuItem[];
}

export interface AuthModel {
  UserID: number;
  Username: string;
  FullName: string;
  AvatarImage: string;
  Email: string;
  Phone: string;
  Status: boolean;
  StatusName: string;
  ProjectID: number | null;
  ProjectCodes: string;
  SelectedProject?: string | null;
  RoleID: number;
  RoleName: string;
  Token: string;
  Menu: MenuItem[];
}
