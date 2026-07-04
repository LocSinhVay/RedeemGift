import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, RefreshCw, Upload } from 'lucide-react';
import { SearchComponent } from '@/components/SearchComponent';

interface FilterBarProps {
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  namespace?: string;
  children?: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  onExport?: () => void;
  exportLabel?: string;
  onImport?: () => void;
  importLabel?: string;
  onRefresh?: () => void;
  showAdd?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  showRefresh?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  searchPlaceholder = 'Tìm kiếm...',
  namespace = 'default',
  children,
  onAdd,
  addLabel = 'Thêm mới',
  onExport,
  exportLabel = 'Xuất',
  onImport,
  importLabel = 'Nhập',
  onRefresh,
  showAdd = true,
  showExport = false,
  showImport = false,
  showRefresh = false,
}) => {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-slate-50/70 p-3 sm:flex-row sm:flex-wrap sm:items-center">
      {/* Search Input using SearchComponent */}
      <SearchComponent
        namespace={namespace}
        placeholder={searchPlaceholder}
        onSearch={onSearch}
      />

      {/* Filter Slots */}
      {children}

      {/* Action Buttons */}
      <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
        {showRefresh && onRefresh && (
          <Button variant="outline" size="icon" onClick={onRefresh} title="Làm mới">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        {showImport && onImport && (
          <Button variant="outline" onClick={onImport} className="flex-1 sm:flex-none">
            <Upload className="h-4 w-4 mr-2" /> {importLabel}
          </Button>
        )}
        {showExport && onExport && (
          <Button variant="outline" onClick={onExport} className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" /> {exportLabel}
          </Button>
        )}
        {showAdd && onAdd && (
          <Button onClick={onAdd} className="flex-1 shadow-sm sm:flex-none">
            <Plus className="h-4 w-4 mr-2" /> {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
