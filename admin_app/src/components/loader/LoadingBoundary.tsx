import React from "react";
import Spinner from "../../assets/images/Spinner.svg";
import { BaseProps } from "../../definitions/props.definition";

interface LoadingBoundaryProps extends BaseProps {
  isLoading: boolean,
  isError: boolean
}
const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  isLoading,
  children,
  isError
}) => {

  if(isError) return (
        <div className="w-full h-full flex items-center justify-center">
                <small>There is a problem fetching resources.</small>
        </div>
  )
  return isLoading ? (
      <div className="w-full h-full flex items-center justify-center">
        <img src={Spinner} alt="loading" className="w-10"></img>
      </div>
    
  ) : (
    <> {children}</>
  );
};

export default LoadingBoundary;
