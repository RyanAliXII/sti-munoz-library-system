import { ButtonHTMLAttributes } from "react";

export enum ButtonClasses {
  PrimaryButtonDefaultClasslist = "bg-blue-500 p-2 rounded text-sm text-white font-semibold disabled:opacity-75",
  DangerButtonDefaultClasslist = "bg-red-500 p-2 rounded text-sm text-white font-semibold",
  DangerButtonOutlineClasslist = "bg-white border border-red-500 text-red-500 p-2 rounded text-sm  font-semibold",
  SecondaryButtonDefaultClasslist = "bg-yellow-400 p-2 text-sm rounded text-white font-semibold",
  LightButtonDefaultClasslist = "bg-gray-400 p-2 rounded text-sm text-white font-semibold",
  WarningButtonDefaultClasslist = "bg-orange-500 p-2  text-sm rounded text-white font-semibold",
  PrimaryOutlineButtonClasslist = "bg-white p-2 border border-blue-500 text-blue-500 rounded",
  SecondaryOutlineButtonClasslist = "bg-white p-2 border border-yellow-500 text-yellow-500 rounded",
  LightOutlineButtonClasslist = "bg-white p-2 border border-gray-300  text-gray-500 rounded",
  WarningButtonOutlineClasslist = "bg-white p-2  text-sm rounded border border-orange-500 text-orange-500 font-semibold",
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

export const PrimaryOutlineButton: React.FC<ButtonProps> = (
  props: ButtonProps
) => {
  return (
    <button
      {...{
        ...props,
        className: `${ButtonClasses.PrimaryOutlineButtonClasslist} ${props?.className}`,
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
