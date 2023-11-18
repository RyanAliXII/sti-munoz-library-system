import { Label } from "flowbite-react";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
interface CustomDatePickerProps extends ReactDatePickerProps {
  label?: string;
  error?: any;
  wrapperclass?: string;
}
const CustomDatePicker = (props: CustomDatePickerProps) => {
  const DefaultClass =
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";
  const ErrorClass =
    "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg focus:ring-red-500 dark:bg-gray-700 focus:border-red-500 block w-full p-2.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500";
  const inputClass = props.error ? ErrorClass : DefaultClass;
  return (
    <>
      {props.label && <Label>{props.label}</Label>}

      <div className={`w-full ${props.wrapperClassName ?? ""}`}>
        <DatePicker
          {...{
            ...props,
            className: `${inputClass} ${props.className} `,
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
