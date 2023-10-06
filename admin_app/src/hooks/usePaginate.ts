import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const usePaginate = ({
  initialPage = 1,
  numberOfPages = 0,
}: {
  initialPage: number | (() => number);
  numberOfPages: number;
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(numberOfPages);
  const [params, setUrlSearchParams] = useSearchParams();
  const nextPage = () => {
    if (currentPage === totalPages) return;
    setCurrentPage((prevPage) => prevPage + 1);
  };
  const previousPage = () => {
    if (currentPage === 1) return;
    setCurrentPage((prevPage) => prevPage - 1);
  };

  useEffect(() => {
    setUrlSearchParams({ page: currentPage.toString() });
  }, [currentPage]);
  useEffect(() => {
    const page = params.get("page");
    if (page) {
      setCurrentPage(parseInt(page));
    }
  }, [params]);
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
