import { useState } from "react";
import {
  DrawerButtonProps,
  DrawerProps,
} from "../../definitions/interfaces/Props";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
const Drawer = ({ children, drawerButton }: DrawerProps) => {
  const [visible, setVisibility] = useState(false);
  return (
    <div className="w-full">
      <div
        className="w-full cursor-pointer flex items-center justify-between"
        onClick={() => {
          setVisibility((prev) => !prev);
        }}
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
