import React, { ButtonHTMLAttributes } from "react";

interface InputProps extends HTMLInputProps {
  label?: string;
  error?: any;
  wrapperclass?: string;
  // props?: HTMLInputProps;
}
interface HTMLInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export enum ButtonClasses {
  PrimaryButtonDefaultClasslist = "bg-blue-500 p-2 rounded text-sm text-white font-semibold",
  DangerButtonDefaultClasslist = "bg-red-500 p-2 rounded text-sm text-white font-semibold",
  SecondaryButtonDefaultClasslist = "bg-yellow-400 p-2 text-sm rounded text-white font-semibold",
  LightButtonDefaultClasslist = "bg-white border p-2 rounded text-sm text-gray-700 font-semibold",
  WarningButtonDefaultClasslist = "bg-orange-500 p-2  text-sm rounded text-white font-semibold",
}
export enum InputClasses {
  InputDefaultClasslist = `form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 
  rounded transition ease-in-out
  focus:text-gray-700 focus:bg-white focus:outline-yellow-400`,
  InputErrorClasslist = "border-red-500 focus:border-red-500",
  LabelWrapperClasslist = "h-2 flex items-center mt-2",
  LabelClasslist = "text-gray-500 text-sm ml-1",
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
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return (
      <>
        <label className={InputClasses.LabelClasslist} htmlFor={props?.name}>
          {props.label}
        </label>

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
          <div className="h-2 flex items-center mt-2">
            <small className="text-red-500">{props.error}</small>
          </div>
        </div>
      </>
    );
  }
);

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
