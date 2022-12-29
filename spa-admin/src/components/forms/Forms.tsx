import React, { ButtonHTMLAttributes, SelectHTMLAttributes } from "react";

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
export enum SelectClasses {
  SelectDefaultClasslist = `form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white border border-solid border-gray-300 
  rounded transition ease-in-out
  focus:text-gray-700 focus:bg-white focus:outline-yellow-400`,
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

export interface SelectProps {
  props?: SelectHTMLAttributes<HTMLSelectElement>;
  labelText: string;
  options?: any[];
  idKey: any;
  textKey: any;
}
export const Select: React.FC<SelectProps> = ({
  options,
  labelText,
  idKey,
  textKey,
  props,
}) => {
  return (
    <>
      <label>{labelText}</label>
      <select
        {...{
          ...props,
          className: `${SelectClasses.SelectDefaultClasslist} ${props?.className}`,
        }}
      >
        <option>Choose</option>
        {options?.map((opt) => {
          return <option key={opt[idKey]}>{opt[textKey]}</option>;
        })}
      </select>
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
