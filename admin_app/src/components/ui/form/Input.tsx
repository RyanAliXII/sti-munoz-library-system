import React, { ButtonHTMLAttributes } from "react";
import { Checkbox, CheckboxProps, Label, TextInput } from "flowbite-react";
import { error } from "console";
interface HTMLInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
export interface InputProps extends HTMLInputProps {
  label?: string;
  error?: any;
  wrapperclass?: string;
}
export enum InputClasses {
  InputDefaultClasslist = `form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 
  rounded transition ease-in-out
  focus:text-gray-700 focus:bg-white focus:outline-yellow-400 disabled:opacity-50`,
  InputErrorClasslist = "border-red-500 focus:border-red-500",
  LabelWrapperClasslist = "h-2 flex items-center mt-2",
  LabelClasslist = "text-gray-500 text-sm ml-1 dark:text-gray-400",
  InputBorderClasslist = "border-solid border-gray-300",
}
export enum SelectClasses {
  SelectDefaultClasslist = `form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white border border-solid border-gray-300 
  rounded transition ease-in-out
  focus:text-gray-700 focus:bg-white focus:outline-blue-500`,
}
export enum TextAreaClasses {
  DefaultClasslist = `
  block
  w-full
  px-3
  py-1.5
  text-base
  font-normal
  text-gray-700
  bg-white bg-clip-padding
  border border-solid border-gray-300
  rounded
  transition
  ease-in-out
  m-0
  h-28
  focus:text-gray-700 focus:bg-white focus:border-yellow-400 focus:outline-none
  resize-none`,
  ErrorClasslist = `
  block
  w-full
  px-3
  py-1.5
  text-base
  font-normal
  text-gray-700
  bg-white bg-clip-padding
  border border-solid border-red-500
  rounded
  transition
  ease-in-out
  m-0
  h-28
  focus:text-gray-700 focus:bg-white focus:border-yellow-400 focus:outline-none
  resize-none`,
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return (
      <>
        {props.label && (
          <label className={InputClasses.LabelClasslist} htmlFor={props?.name}>
            {props.label}
          </label>
        )}
        <div className={`w-full ${props.wrapperclass ?? ""}`}>
          <input
            ref={ref}
            name={props?.name}
            placeholder={props?.placeholder}
            {...{
              ...props,
              className: `${InputClasses.InputDefaultClasslist} ${
                props?.className ?? ""
              } ${props.error ? InputClasses.InputErrorClasslist : ""}`,
            }}
          />
          <div className="h-2 flex items-center py-2 mt-1">
            <small className="text-red-500 ml-1">{props.error}</small>
          </div>
        </div>
      </>
    );
  }
);

export const CustomInput = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const copyProps = { ...props };
    if (props.error) {
      copyProps["color"] = "failure";
    }
    return (
      <>
        {props.label && <Label>{props.label}</Label>}
        <TextInput {...copyProps} ref={ref}></TextInput>
        <div className="h-2 flex items-center py-2 mt-1">
          <small className="text-red-500 ml-1">{props.error}</small>
        </div>
      </>
    );
  }
);

interface CustomCheckboxProps extends CheckboxProps {
  label?: string;
  error?: any;
}
export const CustomCheckBox = React.forwardRef<
  HTMLInputElement,
  CustomCheckboxProps
>((props, ref) => {
  const copyProps = { ...props };
  if (props.error) {
    copyProps["color"] = "failure";
  }
  return (
    <>
      <Checkbox />
      {props.label && (
        <label className={InputClasses.LabelClasslist} htmlFor={props?.name}>
          {props.label}
        </label>
      )}

      <div className="h-2 flex items-center py-2 mt-1">
        <small className="text-red-500 ml-1">{props.error}</small>
      </div>
    </>
  );
});
