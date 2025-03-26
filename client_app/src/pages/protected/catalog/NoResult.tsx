import NoResultSVG from "@assets/images/empty-book.svg";
import { FC } from "react";

type NoResultProps = {
  show: boolean;
};
const NoResult: FC<NoResultProps> = ({ show }) => {
  if (!show) return null;
  return (
    <div className="w-full flex flex-col items-center justify-center gap-5">
      <h4 className="text-lg sm:text-xl  text-gray-600 dark:text-gray-400">
        No resources found.
      </h4>
    </div>
  );
};

export default NoResult;
