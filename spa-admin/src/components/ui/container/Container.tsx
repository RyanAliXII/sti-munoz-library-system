import React from "react";

const Container = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...{
        ...props,
        className: `w-full lg:w-11/12 bg-white lg:rounded-md mx-auto mb-4 border border-2 border-gray-200 ${props.className}`,
      }}
    >
      {props.children}
    </div>
  );
};

export const ContainerNoBackground = (
  props: React.HTMLAttributes<HTMLDivElement>
) => {
  return (
    <div
      {...{
        ...props,
        className: `w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-4 ${props.className}`,
      }}
    >
      {props.children}
    </div>
  );
};

export default Container;
