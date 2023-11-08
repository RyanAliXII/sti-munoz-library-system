import React from "react";

const Container = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      {...{
        ...props,
        className: `block items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 sm:flex  ${
          props.className ?? ""
        } `,
      }}
    >
      <div className="mb-1 w-full">
        <div className="mb-4">{props.children}</div>
      </div>
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
