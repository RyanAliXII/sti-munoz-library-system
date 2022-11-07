import { useState } from "react";
import {
  DrawerButtonProps,
  DrawerProps,
} from "../../definitions/props.definition";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import useToggle from "../../hooks/useToggle";
const Drawer = ({ children, drawerButton }: DrawerProps) => {
  const {toggle, value: visible} = useToggle()
  return (
    <div className="w-full">
      <div
        className="w-full cursor-pointer flex items-center justify-between"
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
export const DrawerButton = ({ icon, text }: DrawerButtonProps) => {
  return (
    <div className="ml-5 flex items-center h-11 gap-1">
      {icon} <span>{text}</span>
    </div>
  );
};

export default Drawer;
