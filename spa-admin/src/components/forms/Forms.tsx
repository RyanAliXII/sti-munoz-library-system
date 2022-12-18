import React, { ChangeEvent } from "react";

interface InputProps {
  labelText: string 
  error?: string
  props?:HTMLInputProps
}
interface HTMLInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}


export const PRIMARY_BTN_DEFAULT_CLASS = "bg-blue-600 p-2 rounded text-white"
export const SECONDARY_BTN_DEFAULT_CLASS = "bg-yellow-400 p-2 rounded text-white"
export const LIGHT_BTN_DEFAULT_CLASS = "bg-gray-400 p-2 rounded text-white"

export const Input: React.FC<InputProps> = ({
  labelText,
  error,
  props,
}) => {

  const CLASS_NAME = `
  form-control
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
  focus:text-gray-700 focus:bg-white focus:outline-yellow-400 
`
const ERROR_BORDER_CLASS = "border-red-500 focus:border-red-500"
  return (
    <>
      <label className="text-gray-700" htmlFor={props?.name}>{labelText}</label>
      <input
        className={error ? `${CLASS_NAME} ${ERROR_BORDER_CLASS}`: CLASS_NAME}
        name={props?.name}
        placeholder={props?.placeholder}
        {...props}
      />
      <div className="h-2 flex items-center mt-2">
        <small className="text-red-500">{error}</small>
      </div>
    </>
  );
};

interface HTMLButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{}

interface ButtonProps  {
    buttonText?: string
    props?: HTMLButtonProps
    children?: React.ReactNode
}

export const PrimaryButton: React.FC<ButtonProps> = ({buttonText, props, children}) => {
  return (
    <button className={PRIMARY_BTN_DEFAULT_CLASS} {...props}>
    {children ? children : buttonText}
  </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({buttonText, props, children}) => {
  return (
    <button className={SECONDARY_BTN_DEFAULT_CLASS} {...props}>
      {children ? children : buttonText}
    </button>
  );
};
export const LighButton: React.FC<ButtonProps> = ({buttonText, props, children}) => {
  return (
    <button className={LIGHT_BTN_DEFAULT_CLASS} {...props}>
      {children ? children : buttonText}
    </button>
  );
};
