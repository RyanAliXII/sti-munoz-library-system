import React, { useEffect, useState } from "react";
import Spinner from "../../assets/images/Spinner.svg";
import { BiErrorCircle } from "react-icons/bi";
import { BaseProps } from "../../definitions/props.definition";
import useDebounce from "@hooks/useDebounce";

interface LoadingBoundaryProps extends BaseProps {
  isLoading: boolean;
  isError: boolean;
  isLoadingDisabled?: boolean;
  contentLoadDelay?: number;
}

const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  isLoading,
  children,
  isLoadingDisabled = false,
  isError,
  contentLoadDelay = 0,
}) => {
  const [isDebounceDone, setIsDebounceDone] = useState<boolean>(true);
  const debounce = useDebounce();

  useEffect(() => {
    if (isLoading) return;
    if (contentLoadDelay > 0) {
      setIsDebounceDone(false);

      debounce(
        () => {
          setIsDebounceDone(true);
        },
        null,
        contentLoadDelay
      );
    }
  }, [isLoading]);
  if (isError)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <BiErrorCircle className="text-lg text-gray-500" />
        <small className="text-sm text-gray-500">
          There is a problem fetching resources. Try refreshing the page or try
          again later.
        </small>
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

export const LoadingBoundaryV2: React.FC<LoadingBoundaryProps> = ({
  isLoading,
  children,
  isError,
  contentLoadDelay = 0,
}) => {
  const [isContentDelayDone, setContentLoadDelayDone] = useState<boolean>(true);
  const debounce = useDebounce();

  useEffect(() => {
    if (isLoading) return;
    if (contentLoadDelay > 0) {
      setContentLoadDelayDone(false);
      debounce(
        () => {
          setContentLoadDelayDone(true);
        },
        null,
        contentLoadDelay
      );
    }
  }, [isLoading]);

  const loaderClass =
    isLoading || !isContentDelayDone
      ? "w-full h-full flex items-center justify-center"
      : "hidden";
  const errorClass =
    isError && isContentDelayDone
      ? "w-full h-full flex items-center justify-center gap-0.5"
      : "hidden";

  const contentClass =
    isError || isLoading || !isContentDelayDone ? "hidden" : "";
  return (
    <>
      <div className={errorClass}>
        <BiErrorCircle className="text-lg text-gray-500" />
        <small className="text-sm text-gray-500">
          There is a problem fetching resources. Try refreshing the page or try
          again later.
        </small>
      </div>
      <div className={loaderClass}>
        <img src={Spinner} alt="loading" className="w-10"></img>
      </div>
      <div className={contentClass}>{children}</div>
    </>
  );
};

export default LoadingBoundary;
