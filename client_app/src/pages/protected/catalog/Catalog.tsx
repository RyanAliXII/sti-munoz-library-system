import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { apiScope } from "@definitions/configs/msal/scopes";
import { buildS3Url } from "@definitions/s3";
import { Book } from "@definitions/types";
import usePaginate from "@hooks/usePaginate";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import {
  ChangeEvent,
  KeyboardEvent,
  KeyboardEventHandler,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import { RiFilter3Fill } from "react-icons/ri";
import ReactPaginate from "react-paginate";
import { Link, useSearchParams } from "react-router-dom";

const Catalog = () => {
  const { Get } = useRequest();
  const [windowSize, setWindowSize] = useState(window.innerWidth);
  const [params, _] = useSearchParams();
  const [tempkeywordStore, setTempKeywordStore] = useState("");
  const [keyword, setKeyword] = useState("");
  const initCurrentPage = () => {
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
  };
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

  const { currentPage, totalPages, setTotalPages, setCurrentPage } =
    usePaginate({
      initialPage: initCurrentPage,
      numberOfPages: 1,
    });
  const fetchBooks = async () => {
    try {
      const { data: response } = await Get(
        "/books/",
        {
          params: {
            page: currentPage,
            keyword: keyword,
          },
        },
        [apiScope("Book.Read")]
      );
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
    queryKey: ["books", currentPage, keyword],
  });
  const alertDev = () => {
    window.alert("Feature still in development.");
  };
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setTempKeywordStore(event.target.value);
  };
  const search = () => {
    if (keyword === tempkeywordStore) return;
    setKeyword(tempkeywordStore);
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
        <div className="w-full  flex flex-col items-center mt-5 gap-3">
          <div
            className="hidden md:flex w-11/12 md:w-7/12 lg:w-6/12 gap-2"
            style={{
              maxWidth: "800px",
            }}
          >
            <input
              type="text"
              className="input input-bordered width flex-1"
              onChange={handleSearch}
              onKeyDown={handleKeydown}
            ></input>
            <button
              type="button"
              onClick={search}
              className="bg-primary text-sm py-1 px-3 lg:px-5 rounded text-base-100"
            >
              Search
            </button>
          </div>
          <div
            className="hidden w-11/12 md:w-7/12 lg:w-6/12 md:flex gap-2"
            style={{
              maxWidth: "800px",
            }}
          >
            <span
              className="py-2 px-5 border rounded-full text-xs md:text-sm cursor-pointer flex gap-1 items-center text-gray-500"
              onClick={alertDev}
            >
              <RiFilter3Fill />
              Filter
            </span>
            <span
              className="py-2 px-5 rounded-full text-xs md:text-sm cursor-pointer  text-blue-500 bg-blue-100"
              onClick={alertDev}
            >
              Thesis
            </span>
            <span
              className="py-2 px-5 rounded-full text-xs md:text-sm cursor-pointer   text-blue-500 border-blue-100 border"
              onClick={alertDev}
            >
              Filipiniana
            </span>
            <span
              className="py-2 px-5 rounded-full text-xs md:text-sm cursor-pointer  text-blue-500 border-blue-100 border hidden md:block"
              onClick={alertDev}
            >
              Reference
            </span>
          </div>

          {books?.map((book) => {
            let bookCover = "";
            if (book.covers.length > 0) {
              bookCover = buildS3Url(book.covers[0]);
            }

            const authors = book.authors.map((author) => author.name);
            // const peopleAuthors = book?.authors.people?.map(
            //   (author) => `${author.givenName} ${author.surname}`
            // );
            // const orgAuthors = book?.authors.organizations?.map((org) => org.name);
            // const publisherAuthors = book?.authors.publishers.map((p) => p.name);
            // const authors = [...peopleAuthors, ...orgAuthors, ...publisherAuthors];
            const isBookAvailable = book.accessions.some(
              (a) => a.isAvailable === true
            );

            return (
              <div
                className="w-11/12 md:w-7/12 lg:w-6/12 h-44 rounded shadow  md:h-60 lg:h-64 border border-gray-100 p-4 flex gap-5"
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
                    >
                      <small className="font-bold text-xs">NO COVER</small>
                    </div>
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
                  {isBookAvailable && (
                    <p className="text-xs md:text-sm text-success">Available</p>
                  )}
                  {!isBookAvailable && (
                    <p className="text-xs md:text-sm text-warning">
                      Unavailable
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="w-full p-10 flex justify-center">
          <ReactPaginate
            nextLabel="Next"
            pageLinkClassName="text-sm lg:text-base border px-3 py-0.5  text-center rounded"
            pageCount={totalPages}
            marginPagesDisplayed={marginPageDisplayed}
            forcePage={currentPage - 1}
            disabledClassName="opacity-60 pointer-events-none"
            onPageChange={({ selected }) => {
              setCurrentPage(selected + 1);
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
