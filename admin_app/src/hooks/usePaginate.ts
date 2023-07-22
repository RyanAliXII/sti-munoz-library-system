import { useState } from "react";

const usePaginate = ({ initialPage = 1, totalPages = 0 }) => {
  const [currentPage, setPage] = useState<number>(initialPage);
  const [pages, setPages] = useState<number>(totalPages);

  return {};
};
