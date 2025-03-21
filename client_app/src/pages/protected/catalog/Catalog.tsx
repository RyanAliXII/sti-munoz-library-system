import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { Book } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import { Button, Pagination } from "flowbite-react";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { CiFilter } from "react-icons/ci";
import { useSearchParamsState } from "react-use-search-params-state";
import BookList from "./BookList";
import SearchBar from "./SearchBar";
import SidebarFilters from "./SidebarFilters";

const Catalog = () => {
  const { Get } = useRequest();
  const [totalPages, setTotalPages] = useState(1);
  const [tempKeyword, setTempKeyword] = useState("");
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
    tags: { type: "string", multiple: true, default: [] },
    collections: { type: "number", multiple: true, default: [] },
    fromYearPublished: { type: "number", default: 1980 },
    toYearPublished: { type: "number", default: new Date().getFullYear() },
  });
  const fetchBooks = async () => {
    try {
      const { data: response } = await Get("/books/", { params: filterParams });
      setTotalPages(response?.data?.metadata?.pages ?? 1);
      return response?.data?.books ?? [];
    } catch {
      return [];
    }
  };

  const { data: books, isError, isFetching } = useQuery<Book[]>({
    queryFn: fetchBooks,
    queryKey: ["books", filterParams],
  });

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTempKeyword(event.target.value);
  };

  const handleSearchSubmit = () => {
    if (filterParams.keyword !== tempKeyword) {
      setFilterParams({ keyword: tempKeyword });
    }
  };
  const handleSearchKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") handleSearchSubmit();
  };
  const {close,open, isOpen} = useSwitch()
  return (
    <div className="flex min-h-screen">
      <SidebarFilters close={close} isOpen={isOpen} filterParams={filterParams} setFilterParams={setFilterParams} />
      <div className="lg:w-64"></div>
      <div className="flex-1">
        <SearchBar
          value={tempKeyword}
          onChange={handleSearchChange}
          onSearch={handleSearchSubmit}
          onKeyDown={handleSearchKeydown}
        />
         <div className="px-5 py-2 lg:hidden">
         <Button  size="sm" color="light" className="p-2" onClick={open}>
          <div className="flex gap-1 items-center">
          <CiFilter/>
          FILTERS
          </div></Button>
         </div>
        
        <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
          <BookList books={books ?? []} />
          <div className="p-5 lg:p-10">
          <Pagination currentPage={filterParams.page} totalPages={totalPages} onPageChange={(pageNumber) => {
            setFilterParams({ page: pageNumber});
          }}></Pagination>
          </div>
        </LoadingBoundaryV2>
        
   
      </div>
    </div>
  );
};

export default Catalog;
