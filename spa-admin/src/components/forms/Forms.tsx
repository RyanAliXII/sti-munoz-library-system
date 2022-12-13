import React, { ChangeEvent } from "react";

interface InputProps {
  labelText: string 
  props?:HTMLInputProps
}
interface HTMLInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({
  labelText,
  props,
}) => {
  return (
    <>
      <label htmlFor={props?.name}>{labelText}</label>
      <input
        className="
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
      m-0
      focus:text-gray-700 focus:bg-white focus:border-yellow-300 focus:outline-none
    "
        name={props?.name}
        placeholder={props?.placeholder}
        {...props}
      />
    </>
  );
};

interface ButtonProps  {
    buttonText: string
    props?: HTMLButtonProps
}
interface HTMLButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{}
export const PrimaryButton: React.FC<ButtonProps> = ({buttonText, props}) => {
  return (
    <button className="bg-blue-600 p-2 rounded text-white" {...props}>
      {buttonText}
    </button>
  );
};
