import React from "react";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";
import { InputClasses } from "./Forms";

interface CustomDatePickerProps extends ReactDatePickerProps {
  label?: string;
  error?: any;
  wrapperclass?: string;
}
const CustomDatePicker = (props: CustomDatePickerProps) => {
  return (
    <>
      <label className="text-gray-500" htmlFor={props?.name}>
        {props.label}
      </label>
      <div className={`w-full ${props.wrapperClassName}`}>
        <DatePicker
          {...{
            ...props,
            className: `${InputClasses.InputDefaultClasslist} ${props.className}`,
          }}
        ></DatePicker>
        <div className="h-2 flex items-center mt-2">
          <small className="text-red-500">{props.error}</small>
        </div>
      </div>
    </>
  );
};

export default CustomDatePicker;
