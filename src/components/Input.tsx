import './Input.css';
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  onChange: (value: number) => void;
};

const Input = ({label, onChange, ...inputProps}: InputProps) => (
  <label className="input_label">
    {label}
    <input
      className="input_field"
      {...inputProps}
      onChange={e => {
        onChange(Number(e.target.value));
      }}
    />
  </label>
);

export default Input;
