import { ButtonHTMLAttributes } from "react";

export enum ButtonClasses {
  PrimaryButtonDefaultClasslist = "bg-blue-500 p-2 rounded text-sm text-white font-semibold disabled:opacity-75",
  DangerButtonDefaultClasslist = "bg-red-500 p-2 rounded text-sm text-white font-semibold",
  SecondaryButtonDefaultClasslist = "bg-yellow-400 p-2 text-sm rounded text-white font-semibold",
  LightButtonDefaultClasslist = "bg-gray-400 p-2 rounded text-sm text-white font-semibold",
  WarningButtonDefaultClasslist = "bg-orange-500 p-2  text-sm rounded text-white font-semibold",
  SecondaryOutlineButtonClasslist = "bg-white p-2 border border-yellow-500 text-yellow-500 rounded",
  LightOutlineButtonClasslist = "bg-white p-2 border border-gray-300  text-gray-500 rounded",
}

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

export const SecondaryOutlineButton: React.FC<ButtonProps> = (
  props: ButtonProps
) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.SecondaryOutlineButtonClasslist} ${props?.className}`,
      }}
    >
      {props.children}
    </button>
  );
};
export const LightOutlineButton: React.FC<ButtonProps> = (
  props: ButtonProps
) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.LightOutlineButtonClasslist} ${props?.className}`,
      }}
    >
      {props.children}
    </button>
  );
};
