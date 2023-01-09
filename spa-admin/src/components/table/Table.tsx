import { HTMLAttributes, TableHTMLAttributes } from "react";

export enum TableElementClasses {
  TableClasslist = "w-full",
  TheadClasslist = "bg-gray-50 text-gray-400",
  HeadingRowClasslist = "border border-l-0 border-r-0 border-t-0",
  ThClasslist = "py-3 text-left px-2 text-sm font-semibold",
  BodyRowClasslist = "border border-l-0 border-r-0 border-t-0 text-gray-500 font-medium hover:bg-gray-50",
  TdClasslist = "p-3 text-md",
}

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {}
export const Table = (props: TableProps) => {
  return (
    <table className="w-full" {...props}>
      {props.children}
    </table>
  );
};

export interface TableSectionProps
  extends HTMLAttributes<HTMLTableSectionElement> {}
export const Tbody = (props: TableSectionProps) => {
  return <tbody {...props}>{props.children}</tbody>;
};
export const Thead = (props: TableSectionProps) => {
  return (
    <thead
      {...{
        ...props,
        className: `${TableElementClasses.TheadClasslist} ${props.className}`,
      }}
    >
      {props.children}
    </thead>
  );
};
export interface RowProps extends HTMLAttributes<HTMLTableRowElement> {}
export const HeadingRow = (props: RowProps) => {
  return (
    <tr
      {...{
        ...props,
        className: `${TableElementClasses.HeadingRowClasslist} ${props.className}`,
      }}
    >
      {props.children}
    </tr>
  );
};

export const BodyRow = (props: RowProps) => {
  return (
    <tr
      {...{
        ...props,
        className: `${TableElementClasses.BodyRowClasslist} ${props.className}`,
      }}
    >
      {props.children}
    </tr>
  );
};

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {}
export const Td = (props: TableCellProps) => {
  return (
    <td
      {...{
        ...props,
        className: `${TableElementClasses.TdClasslist} ${props.className}`,
      }}
    >
      {props.children}
    </td>
  );
};
export const Th = (props: TableCellProps) => {
  return (
    <th
      {...{
        ...props,
        className: `${TableElementClasses.ThClasslist} ${props.className}`,
      }}
    >
      {props.children}
    </th>
  );
};

export default {
  Table,
  Thead,
  Tbody,
  HeadingRow,
  BodyRow,
  Td,
  Th,
};
