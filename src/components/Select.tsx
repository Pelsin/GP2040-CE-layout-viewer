import React from 'react';
import './Select.css';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: Record<string, number>;
  onChange: (value: number) => void;
};

const Select = ({label, options, onChange, ...selectProps}: SelectProps) => (
  <label className="select_label">
    {label}
    <select
      className="select_field"
      {...selectProps}
      onChange={e => {
        onChange(Number(e.target.value));
      }}>
      {Object.entries(options).map(([key, value]) => (
        <option key={key} value={value}>
          {key}
        </option>
      ))}
    </select>
  </label>
);

export default Select;
