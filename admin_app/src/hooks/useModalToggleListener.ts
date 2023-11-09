import { useEffect } from "react";

const useModalToggleListener = (
  state: boolean,
  onToggle: (state: boolean) => void
) => {
  useEffect(() => {
    onToggle(state);
  }, [state]);
};

export default useModalToggleListener;
