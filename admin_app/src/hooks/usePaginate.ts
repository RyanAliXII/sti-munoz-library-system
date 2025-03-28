import { useState } from "react";

const usePaginate = ({
  initialPage = 0,
  numberOfPages = 0,
}: {
  initialPage: number;
  numberOfPages: number;
  useURLParamsAsState?: boolean;
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(numberOfPages);

  const nextPage = () => {
    if (currentPage === totalPages) return;
    setCurrentPage((prevPage) => prevPage + 1);
  };
  const previousPage = () => {
    if (currentPage === 1) return;
    setCurrentPage((prevPage) => prevPage - 1);
  };

  return {
    currentPage,
    totalPages,
    nextPage,
    previousPage,
    setTotalPages,
    setCurrentPage,
  };
};

export default usePaginate;
