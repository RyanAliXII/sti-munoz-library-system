import { useState } from "react";

const useToggle = (initial?: boolean) => {
  const [bool, setBool] = useState<boolean>(initial ?? false);
  return {
    value: bool,
    toggle: () => {
      setBool((prev) => !prev);
    },
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

export type UseSwitchFunc = {
  isOpen: boolean;
  close: () => void;
  open: () => void;
  set: (bool: boolean) => void;
};
export const useSwitch = (initial?: boolean): UseSwitchFunc => {
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
