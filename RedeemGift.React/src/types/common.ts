// Common Types - Giữ nguyên từ code gốc

export interface OptionType {
  value: string;
  label: string;
}

export interface RoleOption {
  value: string;
  label: string;
  symbol?: string;
}

export interface OptionTypeWithType {
  value: number | string;
  label: string;
  type: string;
}

export interface SpinData {
  billTotal: string;
  spinCount: number;
  timestamp: number;
}

export interface Prize {
  id: number;
  projectCode: string;
  name: string;
  probabilityWeight: number;
  quantity: number | null;
}

export interface Project {
  id: number;
  name: string;
}

export interface RedemptionRule {
  ruleID: number;
  projectCode: string;
  billValuePerSpin: number | null;
  maxSpinsPerBill: number | null;
}

// API Response type
export interface ApiResponse<T = unknown> {
  Status: 'Success' | 'Error';
  Message?: string;
  Data?: T;
}

// Pagination type
export interface PaginationState {
  page: number;
  pageSize: number;
  offset: number;
  total: number;
}
