import React from "react";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";

interface CustomDatePickerProps extends ReactDatePickerProps {
  label?: string;
  error?: any;
}
const CustomDatePicker = (props: CustomDatePickerProps) => {
  return (
    <>
      <label className="text-gray-500" htmlFor={props?.name}>
        {props.label}
      </label>
      <DatePicker {...props}></DatePicker>
      <div className="h-2 flex items-center mt-2">
        <small className="text-red-500">{props.error}</small>
      </div>
    </>
  );
};

export default CustomDatePicker;
