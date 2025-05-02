import { type ChangeEventHandler } from 'react';

interface RangePickerProps {
  id: string;
  value: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
  min?: number;
  max?: number;
  step?: number;
}

export const RangePicker = ({ id, value, onChange, min, max, step }: RangePickerProps) => {
  return (
      <input
        id={id}
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg dark:bg-gray-700 mt-2"
      />
  );
};
