import { OptionType } from '@/types';
import React from 'react';
import Select, { SingleValue, StylesConfig } from 'react-select';

interface SearchableComboBoxProps {
  options: OptionType[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  disabled?: boolean;
  className?: string;
  width?: string;
}

const customStyles: StylesConfig<OptionType, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: '40px',
    borderRadius: '8px',
    borderColor: state.isFocused ? 'hsl(217 91% 60%)' : 'hsl(var(--border))',
    boxShadow: state.isFocused ? '0 0 0 1px hsl(217 91% 60%)' : 'none',
    backgroundColor: 'hsl(var(--background))',
    '&:hover': { borderColor: 'hsl(var(--muted-foreground))' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '8px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'hsl(var(--background))',
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'hsl(217 91% 60% / 0.1)'
      : state.isFocused
        ? 'hsl(var(--muted))'
        : 'transparent',
    color: state.isSelected ? 'hsl(217 91% 60%)' : 'hsl(var(--foreground))',
    cursor: 'pointer',
    '&:hover': { backgroundColor: 'hsl(var(--muted))' },
  }),
  singleValue: (base) => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
  input: (base) => ({
    ...base,
    color: 'hsl(var(--foreground))',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'hsl(var(--muted-foreground))',
  }),
};

export const SearchableComboBox: React.FC<SearchableComboBoxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  includeAllOption = false,
  allOptionLabel = 'Tất cả',
  disabled = false,
  className = 'w-48',
  width,
}) => {
  const formattedOptions = includeAllOption
    ? [{ value: '', label: allOptionLabel }, ...options]
    : options;

  const selectedOption = formattedOptions.find(opt => opt.value === value) || null;

  const handleChange = (selected: SingleValue<OptionType>) => {
    onChange(selected?.value ?? '');
  };

  return (
    <div className={className} style={width ? { width } : undefined}>
      <Select<OptionType, false>
        options={formattedOptions}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isSearchable
        isDisabled={disabled}
        noOptionsMessage={() => 'Không có kết quả phù hợp'}
        styles={customStyles}
        classNamePrefix="react-select"
      />
    </div>
  );
};
