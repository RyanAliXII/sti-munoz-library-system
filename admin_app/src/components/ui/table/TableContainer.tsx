import React from "react";

const TableContainer = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">{children}</div>
    </div>
  );
};

export default TableContainer;
