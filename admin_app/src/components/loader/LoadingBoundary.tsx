import React, { useEffect, useState } from "react";
import Spinner from "../../assets/images/Spinner.svg";
import { BaseProps } from "../../definitions/props.definition";
import useDebounce from "@hooks/useDebounce";

interface LoadingBoundaryProps extends BaseProps {
  isLoading: boolean;
  isError: boolean;
  isLoadingDisabled?: boolean;
  delay?: number;
  onDelayDone?: () => void;
  onLoadingStart?: () => void;
}
const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  isLoading,
  children,
  isLoadingDisabled = false,
  isError,
  delay = 0,
  onLoadingStart,
  onDelayDone,
}) => {
  const [isDebounceDone, setIsDebounceDone] = useState<boolean>(true);
  const debounce = useDebounce();

  useEffect(() => {
    if (onLoadingStart) onLoadingStart();
    if (isLoading) return;
    if (delay > 0) {
      setIsDebounceDone(false);

      debounce(
        () => {
          setIsDebounceDone(true);
          if (onDelayDone) onDelayDone();
        },
        null,
        delay
      );
    }
  }, [isLoading]);

  if (isError)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <small>There is a problem fetching resources.</small>
      </div>
    );
  if ((isLoading || !isDebounceDone) && !isLoadingDisabled)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <img src={Spinner} alt="loading" className="w-10"></img>
      </div>
    );

  return <>{children}</>;
};

export default LoadingBoundary;
