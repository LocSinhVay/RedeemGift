import React from 'react';
import Select, { MultiValue, StylesConfig } from 'react-select';

export interface MultiComboBoxOption {
  value: string;
  label: string;
}

interface SearchableMultiComboBoxProps {
  options: MultiComboBoxOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  disabled?: boolean;
  className?: string;
  width?: string;
}

const customStyles: StylesConfig<MultiComboBoxOption, true> = {
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
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'hsl(217 91% 60% / 0.1)',
    borderRadius: '6px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'hsl(217 91% 60%)',
    fontWeight: 500,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'hsl(217 91% 60%)',
    ':hover': { 
      backgroundColor: 'hsl(217 91% 60% / 0.2)', 
      color: 'hsl(var(--foreground))' 
    },
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

export const SearchableMultiComboBox: React.FC<SearchableMultiComboBoxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn nhiều...',
  includeAllOption = false,
  allOptionLabel = 'Tất cả',
  disabled = false,
  className = 'w-48',
  width,
}) => {
  const formattedOptions = includeAllOption
    ? [{ value: 'ALL', label: allOptionLabel }, ...options]
    : options;

  const selectedOptions = formattedOptions.filter(opt => value.includes(opt.value));

  const handleChange = (selected: MultiValue<MultiComboBoxOption>) => {
    const values = selected ? selected.map(s => s.value) : [];
    onChange(values);
  };

  return (
    <div className={className} style={width ? { width } : undefined}>
      <Select<MultiComboBoxOption, true>
        options={formattedOptions}
        value={selectedOptions}
        onChange={handleChange}
        isMulti
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
