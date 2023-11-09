import { ReactNode, createContext, useContext, useState } from "react";

type SidebarState = {
  isOpen: boolean;
  setState: (value: boolean) => void;
  toggle: () => void;
};
export const SidebarContext = createContext<SidebarState>({
  isOpen: false,
  setState: (value: boolean) => false,
  toggle: () => {},
});
const SidebarProvider = ({ children }: { children?: ReactNode }) => {
  const [isOpen, changeState] = useState(false);
  const setState = (value: boolean) => {
    changeState(value);
  };
  const toggle = () => {
    changeState((prev: boolean) => !prev);
  };
  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        setState,
        toggle,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarState = () => {
  return useContext(SidebarContext);
};
export default SidebarProvider;
