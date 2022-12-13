import { ReactNode } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { BaseProps } from "../../definitions/props.definition";
import useToggle from "../../hooks/useToggle";

export const NavigationDropdown = ({ children, drawerButton }: NavigationDropdownProps) => {
  
  const { toggle, value: visible } = useToggle();
  return (
    <div className="w-full">
      <div
        className="w-full cursor-pointer flex items-center justify-between4"
        onClick={toggle}
      >
        {drawerButton}{" "}
        {visible ? (
          <MdKeyboardArrowUp className="mr-3" />
        ) : (
          <MdKeyboardArrowDown className="mr-3" />
        )}
      </div>
      <div className={visible ? "flex flex-col " : "hidden"}>{children}</div>
    </div>
  );
};
export const NavigationDropdownButton = ({ icon, text }: NavigationDropdownButtonProps) => {
  return (
    <div className="ml-5 flex items-center h-11 gap-1">
      {icon} <span>{text}</span>
    </div>
  );
};

export interface NavigationDropdownProps extends BaseProps {
  drawerButton: ReactNode | JSX.Element | JSX.Element[];
}
export interface NavigationDropdownButtonProps extends BaseProps {
  icon: ReactNode | JSX.Element | JSX.Element[];
  text: string;
}
export default NavigationDropdown;
