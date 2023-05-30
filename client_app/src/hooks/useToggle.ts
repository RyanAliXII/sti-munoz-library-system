import { useState } from "react";

const useToggle = (initial?: boolean) => {
  const [bool, setBool] = useState<boolean>(initial ?? false);

  const toggle = () => {
    console.log(bool);
    setBool((prev) => !prev);
  };
  return {
    value: bool,
    toggle: toggle,
  };
};
export const useToggleManual = (initial?: boolean) => {
  const [bool, setBool] = useState<boolean>(initial ?? false);
  return {
    value: bool,
    set: (boolParam: boolean) => {
      setBool((prev) => boolParam);
    },
  };
};
export const useSwitch = (initial?: boolean) => {
  const [bool, setBool] = useState<boolean>(initial ?? false);
  return {
    isOpen: bool,
    close: () => {
      setBool(false);
    },
    open: () => {
      setBool(true);
    },
    set: (bool: boolean) => {
      setBool(bool);
    },
  };
};
export default useToggle;
