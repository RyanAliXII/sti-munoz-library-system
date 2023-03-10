import { Children, ReactNode } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { BaseProps } from "@definitions/props.definition";
import useToggle from "@hooks/useToggle";

export const NavigationDropdown = ({ children, icon, text }: DropdownProps) => {
  const { toggle: toggleNavList, value: isNavListHidden } = useToggle();

  const navLinksCount = Children.toArray(children).length;

  return navLinksCount > 0 ? (
    <div className="w-full">
      <div
        className="w-full cursor-pointer flex items-center justify-between text-gray-500"
        onClick={toggleNavList}
      >
        <div className="ml-5 flex items-center h-11 gap-1 text-gray-500">
          {icon}
          <span className="font-medium text-sm">{text}</span>
        </div>
        {isNavListHidden ? (
          <MdKeyboardArrowUp className="mr-3 " />
        ) : (
          <MdKeyboardArrowDown className="mr-3 " />
        )}
      </div>
      <div className={isNavListHidden ? "flex flex-col " : "hidden"}>
        {children}
      </div>
    </div>
  ) : null;
};

export interface DropdownProps extends BaseProps {
  icon: ReactNode | JSX.Element | JSX.Element[];
  text: string;
}
export default NavigationDropdown;
