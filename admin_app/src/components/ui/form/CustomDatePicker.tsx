import DatePicker, { ReactDatePickerProps } from "react-datepicker";
import { InputClasses } from "./Input";

interface CustomDatePickerProps extends ReactDatePickerProps {
  label?: string;
  error?: any;
  wrapperclass?: string;
}
const CustomDatePicker = (props: CustomDatePickerProps) => {
  return (
    <>
      <label className="text-gray-600 text-sm" htmlFor={props?.name}>
        {props.label}
      </label>
      <div className={`w-full ${props.wrapperClassName ?? ""}`}>
        <DatePicker
          {...{
            ...props,
            className: `bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${props.className} `,
            popperClassName: "bg-gray-50 dark:bg-gray-700",
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
