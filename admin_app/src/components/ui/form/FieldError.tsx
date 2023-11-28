import React, { FC } from "react";

type FieldErrorProps = {
  error: string | undefined;
};
const FieldError: FC<FieldErrorProps> = ({ error }) => {
  if (!error) {
    return null;
  }
  return <div className="text-sm text-red-500">{error}</div>;
};

export default FieldError;
