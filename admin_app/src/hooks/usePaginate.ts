import pages from "@pages/Pages";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const usePaginate = ({
  initialPage = 0,
  numberOfPages = 0,
  useURLParamsAsState = true,
}: {
  initialPage: number;
  numberOfPages: number;
  useURLParamsAsState?: boolean;
}) => {
  const [params, setUrlSearchParams] = useSearchParams();
  const initCurrentPage = () => {
    //initial page will be ignored when useURLParamsAsState is set to true
    // upon loading
    if (initialPage === 0) {
      return 1;
    }
    if (useURLParamsAsState) {
      const page = params.get("page");
      if (!page) {
        return 1;
      }
      const parsedPage = parseInt(page);
      if (isNaN(parsedPage)) {
        return 1;
      }
      if (parsedPage <= 0) {
        return 1;
      }
      return parsedPage;
    }
    return initialPage;
  };
  const [currentPage, setCurrentPage] = useState<number>(initCurrentPage);
  const [totalPages, setTotalPages] = useState<number>(numberOfPages);

  if (useURLParamsAsState) {
    useEffect(() => {
      setUrlSearchParams((prev) => {
        prev.set("page", currentPage.toString());
        return prev;
      });
    }, [currentPage]);

    useEffect(() => {
      const page = params.get("page");
      if (!page) return;
      const parsedPage = parseInt(page);
      if (parsedPage != currentPage) {
        setCurrentPage(parsedPage);
      }
    }, [params]);
  }

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
