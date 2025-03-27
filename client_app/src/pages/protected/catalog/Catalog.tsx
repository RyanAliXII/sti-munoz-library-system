import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { Book } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import useWindowDimensions from "@hooks/useWindowDimensions";
import { useQuery } from "@tanstack/react-query";
import { Button } from "flowbite-react";
import { ChangeEvent, KeyboardEvent, useState } from "react";
import { CiFilter } from "react-icons/ci";
import ReactPaginate from "react-paginate";
import { useSearchParamsState } from "react-use-search-params-state";
import BookList from "./BookList";
import NoResult from "./NoResult";
import SearchBar from "./SearchBar";
import SidebarFilters from "./SidebarFilters";

const Catalog = () => {
  const { Get } = useRequest();
  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
    tags: { type: "string", multiple: true, default: [] },
    collections: { type: "number", multiple: true, default: [] },
    fromYearPublished: { type: "number", default: 1980 },
    toYearPublished: { type: "number", default: new Date().getFullYear() },
  });
  const [tempKeyword, setTempKeyword] = useState(filterParams.keyword ?? "");
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
  const hasNoBooks = !books || books.length === 0; 
  const SMALL_SCREEN = 576  //px
  const MEDIUM_SCREEN = 768 //px
  const LARGE_SCREEN = 1024 //px
  const { width} = useWindowDimensions()
  const screenWidth = (width ?? 0)
  const paginationSettings = 
    screenWidth >= SMALL_SCREEN ? {margin: 2, range: 4} :
    screenWidth >= MEDIUM_SCREEN ? {margin:4, range: 5} : 
    screenWidth >= LARGE_SCREEN ? {margin:6, range: 7}  :{margin:0, range: 3}
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
         <div className="px-5 pt-5 lg:hidden">
         <Button size="sm" color="light" className="p-2" onClick={open}>
          <div className="flex gap-1 items-center">
          <CiFilter/>
          FILTERS
          </div></Button>
         </div>
        
        <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
          <BookList books={books ?? []} />
          <div className="w-full py-4 flex justify-center">
          <ReactPaginate
            nextLabel="Next"
            pageLinkClassName="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            pageCount={totalPages}
            marginPagesDisplayed={paginationSettings.margin}
            forcePage={filterParams?.page - 1}
            disabledClassName="opacity-60 pointer-events-none"
            pageRangeDisplayed={paginationSettings.range}
            onPageChange={({ selected }) => {
              setFilterParams({ page: selected + 1 });
            }}
            className="flex items-center"
            breakClassName="tex-gray-500 dark:text-gray-400 px-0.5"
            previousLabel="Previous"
            previousClassName="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            nextClassName="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            renderOnZeroPageCount={null}
            containerClassName="inline-flex -space-x-px text-sm"
            activeClassName="!text-red-400"
          />
        </div>
        </LoadingBoundaryV2>
       
        <NoResult show={hasNoBooks}/>
      </div>
    </div>
  );
};

export default Catalog;
