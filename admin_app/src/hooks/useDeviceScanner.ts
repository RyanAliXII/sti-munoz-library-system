import { useEffect, useRef } from "react";

type UseDeviceScannerProps = {
  onScan?: (item: string) => void;
};
export const useDeviceScanner = ({ onScan }: UseDeviceScannerProps) => {
  const textArr = useRef<string[]>([]);
  useEffect(() => {
    const waitForEvent = (event: KeyboardEvent) => {
      if (event.key != "Enter") {
        textArr.current.push(event.key.toString());
      } else {
        const text = textArr.current.join("");
        onScan?.(text);
        textArr.current = [];
      }
    };
    window.addEventListener("keypress", waitForEvent);
    return () => {
      window.removeEventListener("keypress", waitForEvent);
    };
  }, [onScan]);
};
