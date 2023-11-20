import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";

import { buildS3Url } from "@definitions/s3";
import { Book } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, KeyboardEvent, useLayoutEffect, useState } from "react";

import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { useSearchParamsState } from "react-use-search-params-state";
import NoResult from "./NoResult";

const Catalog = () => {
  const { Get } = useRequest();
  const [windowSize, setWindowSize] = useState(window.innerWidth);
  const [tempkeywordStore, setTempKeywordStore] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
  });
  useLayoutEffect(() => {
    const handleWindowResize = (event: UIEvent) => {
      const window = event.target as Window;
      setWindowSize(window.innerWidth);
    };
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  const fetchBooks = async () => {
    try {
      const { data: response } = await Get("/books/", {
        params: {
          page: filterParams?.page,
          keyword: filterParams?.keyword,
        },
      });
      if (response?.data?.metadata) {
        setTotalPages(response?.data?.metadata?.pages ?? 1);
      }
      return response?.data?.books ?? [];
    } catch {
      return [];
    }
  };
  const {
    data: books,
    isError,
    isFetching,
  } = useQuery<Book[]>({
    queryFn: fetchBooks,
    queryKey: ["books", filterParams],
  });
  const alertDev = () => {
    window.alert("Feature still in development.");
  };
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setTempKeywordStore(event.target.value);
  };
  const search = () => {
    if (filterParams?.keyword === tempkeywordStore) return;
    setFilterParams({ keyword: tempkeywordStore });
  };
  const handleKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      search();
    }
  };
  const paginationClass =
    totalPages <= 1 ? "hidden" : "flex gap-2 items-center ";
  const marginPageDisplayed =
    windowSize <= 640 ? -6 : windowSize <= 1024 ? 2 : 4;

  return (
    <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
      <div>
        <div className="w-full  pt-5 px-5 lg:px-10">
          <input
            type="text"
            className="input input-bordered w-full"
            onChange={handleSearch}
            onKeyDown={handleKeydown}
            placeholder="Search books"
            defaultValue={filterParams?.keyword}
          ></input>
        </div>
        <div className="w-full grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 p-5 lg:p-10 ">
          {books?.map((book) => {
            let bookCover = "";
            if (book.covers.length > 0) {
              bookCover = buildS3Url(book.covers[0]);
            }

            const authors = book.authors.map((author) => author.name);
            const isBookAvailable = book.accessions.some(
              (a) => a.isAvailable === true
            );

            return (
              <div
                className="flex  p-5"
                style={{
                  maxWidth: "800px",
                }}
                key={book.id}
              >
                <div className="flex items-center justify-center">
                  {(bookCover?.length ?? 0) > 0 ? (
                    <img
                      src={bookCover}
                      alt="book-cover"
                      className="w-28 md:w-44 lg:w-56 object-scale-down"
                      style={{
                        maxWidth: "120px",
                        maxHeight: "150px",
                      }}
                    />
                  ) : (
                    <div
                      className="w-28 md:w-44 lg:w-56 h-56 bg-gray-200 flex items-center justify-center"
                      style={{
                        maxWidth: "120px",
                        maxHeight: "150px",
                      }}
                    ></div>
                  )}
                </div>
                <div className="flex flex-col justify-center p-2  ">
                  <Link
                    to={`/catalog/${book.id}`}
                    className="text-sm md:text-base lg:text-lg font-semibold hover:text-blue-500"
                  >
                    {book.title}
                  </Link>
                  {authors.length > 0 && (
                    <p className="text-xs md:text-sm lg:text-base">
                      by {authors.join(",")}
                    </p>
                  )}
                  <p className="text-xs md:text-sm lg:text-base text-gray-500">
                    Published in {book.yearPublished}
                  </p>
                  <p className="text-xs md:text-sm lg:text-base text-gray-500">
                    {book.section.name} {book.ddc.length > 0 && `- ${book.ddc}`}{" "}
                    {book.authorNumber.length > 0 && `- ${book.authorNumber}`}
                  </p>
                  {(isBookAvailable || book.ebook.length > 0) && (
                    <p className="text-xs md:text-sm text-success">Available</p>
                  )}
                  {!isBookAvailable && book.ebook.length == 0 && (
                    <p className="text-xs md:text-sm text-warning">
                      Unavailable
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <NoResult show={books?.length === 0}></NoResult>
        <div className="w-full p-10 flex justify-center">
          <ReactPaginate
            nextLabel="Next"
            pageLinkClassName="text-sm lg:text-base border px-3 py-0.5  text-center rounded"
            pageCount={totalPages}
            marginPagesDisplayed={marginPageDisplayed}
            forcePage={filterParams?.page - 1}
            disabledClassName="opacity-60 pointer-events-none"
            onPageChange={({ selected }) => {
              setFilterParams({ page: selected + 1 });
            }}
            className={paginationClass}
            previousLabel="Previous"
            previousClassName="text-sm lg:text-base px-2 border text-gray-500 py-1 rounded"
            nextClassName="text-sm  lg:text-base px-2 border text-blue-500 py-1 rounded"
            renderOnZeroPageCount={null}
            containerClassName=""
            activeClassName="border-none bg-blue-500 text-white rounded"
          />
        </div>
      </div>
    </LoadingBoundaryV2>
  );
};

export default Catalog;
