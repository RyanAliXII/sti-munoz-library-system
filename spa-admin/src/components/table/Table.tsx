import { BaseProps } from "../../definitions/props.definition";

export const Table = ({ children, props }: TableProps) => {
  return (
    <table className="w-full" {...props}>
      {children}
    </table>
  );
};
export const DEFAULT_THEAD_CLASS = "bg-gray-50 text-gray-400";
export const Thead = ({ children, props }: TableProps) => {
  return (
    <thead className={DEFAULT_THEAD_CLASS} {...props}>
      {children}
    </thead>
  );
};
export const TrHead = ({ children }: BaseProps) => {
  return (
    <tr className="border border-l-0 border-r-0 border-t-0">{children}</tr>
  );
};
export const Th = ({ children }: BaseProps) => {
  return (
    <th className="py-3 text-left px-2 text-sm font-semibold">{children}</th>
  );
};
export const Tbody = ({ children, props }: TableProps) => {
  return <tbody {...props}>{children}</tbody>;
};

export const TABLE_BODY_ROW_DEFAULT_CLASS =
  "border border-l-0 border-r-0 border-t-0 text-gray-500 font-medium";
export const TrBody = ({ children, props }: TableProps) => {
  return (
    <tr className={TABLE_BODY_ROW_DEFAULT_CLASS} {...props}>
      {children}
    </tr>
  );
};
interface TableProps extends BaseProps {
  props?: React.BaseHTMLAttributes<HTMLElement>;
}
export const Td = ({ children, props }: TableProps) => {
  return (
    <td className="p-2" {...props}>
      {children}
    </td>
  );
};
