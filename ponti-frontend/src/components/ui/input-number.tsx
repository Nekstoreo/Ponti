"use client";

import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

interface InputNumberProps extends Omit<InputProps, "onChange" | "value"> {
  value: number | string;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  ({ className, value, onChange, step = 1, min, max, ...props }, ref) => {
    const [isStepping, setIsStepping] = React.useState(false);

    const getDecimalPlaces = (value: number): number => {
      if (Math.floor(value) === value) return 0;
      const str = value.toString();
      const decimalPart = str.split('.')[1];
      return decimalPart ? decimalPart.length : 0;
    };

    const handleStep = (direction: "up" | "down") => {
      if (isStepping) return;

      const currentValue = typeof value === "string" ? parseFloat(value) : value;
      if (isNaN(currentValue)) return;

      setIsStepping(true);

      let newValue = currentValue + (direction === "up" ? step : -step);

      const decimalPlaces = getDecimalPlaces(step);
      if (decimalPlaces > 0) {
        newValue = parseFloat(newValue.toFixed(decimalPlaces));
      }

      if (min !== undefined) {
        newValue = Math.max(min, newValue);
      }
      if (max !== undefined) {
        newValue = Math.min(max, newValue);
      }
      
      onChange(newValue);

      setTimeout(() => setIsStepping(false), 100);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value);
      if (!isNaN(numValue)) {
        onChange(numValue);
      } else if (e.target.value === "") {
        onChange(0);
      }
    };

    return (
      <div className={`relative flex items-center ${className || ""}`}>
        <input
          type="number"
          ref={ref}
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          className="pr-8 border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...props}
        />
        <div className="absolute right-0 mr-1 flex flex-col">
          <button
            className="h-4 w-6 p-0 bg-transparent hover:bg-gray-100 border-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleStep("up")}
            disabled={props.disabled || isStepping || (max !== undefined && Number(value) >= max)}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            className="h-4 w-6 p-0 bg-transparent hover:bg-gray-100 border-none flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleStep("down")}
            disabled={props.disabled || isStepping || (min !== undefined && Number(value) <= min)}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }
);

InputNumber.displayName = "InputNumber";

export { InputNumber };
