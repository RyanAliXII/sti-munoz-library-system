import NoResultSVG from "@assets/images/empty-book.svg";
import { FC } from "react";

type NoResultProps = {
  show: boolean;
};
const NoResult: FC<NoResultProps> = ({ show }) => {
  if (!show) return null;
  return (
    <div className="w-full flex flex-col items-center justify-center gap-5">
      <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-500">
        NO BOOKS FOUND
      </h2>
      <img
        src={NoResultSVG}
        alt="No Results Found"
        style={{ width: "50%", maxWidth: "600px" }}
      />
    </div>
  );
};

export default NoResult;
