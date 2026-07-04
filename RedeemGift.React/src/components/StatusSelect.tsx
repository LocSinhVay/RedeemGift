import React from 'react';
import { SearchableComboBox } from './SearchableComboBox';

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const STATUS_OPTIONS = [
  { value: '1', label: 'Đang hoạt động' },
  { value: '0', label: 'Đã khóa' },
];

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
  className = 'w-44',
  placeholder = 'Chọn tình trạng',
}) => {
  return (
    <SearchableComboBox
      options={STATUS_OPTIONS}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      includeAllOption
      allOptionLabel="Tất cả tình trạng"
      className={className}
    />
  );
};
