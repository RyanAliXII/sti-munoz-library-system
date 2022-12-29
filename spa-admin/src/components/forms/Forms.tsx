import React, { ChangeEvent } from "react";

interface InputProps {
  labelText: string;
  error?: string;
  props?: HTMLInputProps;
}
interface HTMLInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export enum ButtonClasses {
  PrimaryButtonDefaultClasslist = "bg-blue-600 p-2 rounded text-white",
  DangerButtonDefaultClasslist = "bg-red-500 p-2 rounded text-white",
  SecondaryButtonDefaultClasslist = "bg-yellow-400 p-2 rounded text-white",
  LightButtonDefaultClasslist = "bg-gray-400 p-2 rounded text-white",
}
export enum InputClasses {
  InputDefaultClasslist = `form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 
  rounded transition ease-in-out
  focus:text-gray-700 focus:bg-white focus:outline-yellow-400`,
  InputErrorClassList = "border-red-500 focus:border-red-500",
}

export const Input: React.FC<InputProps> = ({ labelText, error, props }) => {
  return (
    <>
      <label className="text-gray-700" htmlFor={props?.name}>
        {labelText}
      </label>
      <input
        name={props?.name}
        placeholder={props?.placeholder}
        {...{
          ...props,
          className: `${InputClasses.InputDefaultClasslist} ${
            props?.className
          } ${error ? InputClasses.InputErrorClassList : ""}`,
        }}
      />
      <div className="h-2 flex items-center mt-2">
        <small className="text-red-500">{error}</small>
      </div>
    </>
  );
};

interface HTMLButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface ButtonProps {
  buttonText?: string;
  props?: HTMLButtonProps;
  children?: React.ReactNode;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  buttonText,
  props,
  children,
}) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.PrimaryButtonDefaultClasslist} ${props?.className}`,
      }}
    >
      {children ? children : buttonText}
    </button>
  );
};
export const SecondaryButton: React.FC<ButtonProps> = ({
  buttonText,
  props,
  children,
}) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.SecondaryButtonDefaultClasslist} ${props?.className}`,
      }}
    >
      {children ? children : buttonText}
    </button>
  );
};
export const DangerButton: React.FC<ButtonProps> = ({
  buttonText,
  props,
  children,
}) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.DangerButtonDefaultClasslist} ${props?.className}`,
      }}
    >
      {children ? children : buttonText}
    </button>
  );
};
export const LighButton: React.FC<ButtonProps> = ({
  buttonText,
  props,
  children,
}) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.LightButtonDefaultClasslist} ${props?.className}`,
      }}
    >
      {children ? children : buttonText}
    </button>
  );
};
