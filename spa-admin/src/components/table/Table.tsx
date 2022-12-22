import { BaseProps } from "../../definitions/props.definition";

export const Table = ({ children }: BaseProps) => {
  return <table className="w-full">{children}</table>;
};
export const Thead = ({ children }: BaseProps) => {
  return <thead className="bg-gray-50 text-gray-400">{children}</thead>;
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
export const Tbody = ({ children }: BaseProps) => {
  return <tbody>{children}</tbody>;
};

export const TrBody = ({ children }: TableProps) => {
  return (
    <tr className="border border-l-0 border-r-0 border-t-0 text-gray-500 font-medium">
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
