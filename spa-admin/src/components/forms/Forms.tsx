import React, { ButtonHTMLAttributes } from "react";

interface InputProps extends HTMLInputProps {
  label?: string;
  error?: any;
  // props?: HTMLInputProps;
}
interface HTMLInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export enum ButtonClasses {
  PrimaryButtonDefaultClasslist = "bg-blue-600 p-2 rounded text-white",
  DangerButtonDefaultClasslist = "bg-red-500 p-2 rounded text-white",
  SecondaryButtonDefaultClasslist = "bg-yellow-400 p-2 rounded text-white",
  LightButtonDefaultClasslist = "bg-gray-500 p-2 rounded text-white",
  WarningButtonDefaultClasslist = "bg-orange-500 p-2 rounded text-white",
}
export enum InputClasses {
  InputDefaultClasslist = `form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 
  rounded transition ease-in-out
  focus:text-gray-700 focus:bg-white focus:outline-yellow-400`,
  InputErrorClasslist = "border-red-500 focus:border-red-500",
  LabelWrapperClasslist = "h-2 flex items-center mt-2",
  LabelClasslist = "text-red-500",
  InputBorderClasslist = "border-solid border-gray-300",
}
export enum SelectClasses {
  SelectDefaultClasslist = `form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white border border-solid border-gray-300 
  rounded transition ease-in-out
  focus:text-gray-700 focus:bg-white focus:outline-blue-500`,
}

export const Input: React.FC<InputProps> = (props: InputProps) => {
  return (
    <>
      <label className="text-gray-700" htmlFor={props?.name}>
        {props.label}
      </label>
      <input
        name={props?.name}
        placeholder={props?.placeholder}
        {...{
          ...props,
          className: `${InputClasses.InputDefaultClasslist} ${
            props?.className
          } ${props.error ? InputClasses.InputErrorClasslist : ""}`,
        }}
      />
      <div className="h-2 flex items-center mt-2">
        <small className="text-red-500">{props.error}</small>
      </div>
    </>
  );
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const PrimaryButton: React.FC<ButtonProps> = (props: ButtonProps) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.PrimaryButtonDefaultClasslist} ${props?.className}`,
      }}
    >
      {props.children}
    </button>
  );
};
export const SecondaryButton: React.FC<ButtonProps> = (props) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.SecondaryButtonDefaultClasslist} ${props?.className}`,
      }}
    >
      {props.children}
    </button>
  );
};
export const DangerButton: React.FC<ButtonProps> = (props: ButtonProps) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.DangerButtonDefaultClasslist} ${props?.className}`,
      }}
    ></button>
  );
};
export const WarningButton: React.FC<ButtonProps> = (props: ButtonProps) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.WarningButtonDefaultClasslist} ${props?.className}`,
      }}
    ></button>
  );
};
export const LighButton: React.FC<ButtonProps> = (props: ButtonProps) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.LightButtonDefaultClasslist} ${props?.className}`,
      }}
    >
      {props.children}
    </button>
  );
};
