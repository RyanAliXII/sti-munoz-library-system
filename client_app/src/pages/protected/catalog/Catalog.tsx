import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";

import { buildS3Url } from "@definitions/s3";
import { Book, Section } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, KeyboardEvent, useLayoutEffect, useState } from "react";

import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import { useSearchParamsState } from "react-use-search-params-state";
import NoResult from "./NoResult";
import { MdFilterList } from "react-icons/md";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { useCollections } from "@hooks/data-fetching/collection";
import { useSearchTags } from "@hooks/data-fetching/search-tag";
import { MultiValue } from "react-select";
import { useSwitch } from "@hooks/useToggle";

const Catalog = () => {
  const { Get } = useRequest();
  const [windowSize, setWindowSize] = useState(window.innerWidth);
  const [tempkeywordStore, setTempKeywordStore] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const filterDropdown = useSwitch();
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
    tags: { type: "string", multiple: true, default: [] },
    collections: { type: "number", multiple: true, default: [] },
    fromYearPublished: { type: "number", default: 1980 },
    toYearPublished: { type: "number", default: new Date().getFullYear() },
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
          tags: filterParams?.tags ?? [],
          collections: filterParams?.collections ?? [],
          fromYearPublished: filterParams?.fromYearPublished ?? 0,
          toYearPublished: filterParams?.toYearPublished ?? 0,
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
  const { data: collections } = useCollections();
  const { data: tags } = useSearchTags({});

  const handleTagSelect = (
    values: MultiValue<{ label: string; value: string }>
  ) => {
    setFilterParams({
      tags: values.map((v) => v.value),
      page: 1,
    });
  };

  const handleCollectionSelect = (values: MultiValue<Section>) => {
    setFilterParams({
      collections: values?.map((c) => c.id ?? 0),
      page: 1,
    });
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
  const handleFrom = (date: Date) => {
    setFilterParams({
      fromYearPublished: date.getFullYear(),
      page: 1,
    });
  };
  const handleTo = (date: Date) => {
    setFilterParams({
      toYearPublished: date.getFullYear(),
      page: 1,
    });
  };
  const resetFilter = () => {
    setFilterParams({
      keyword: "",
      collections: [],
      mainC: [],
      page: 1,
      tags: [],
      fromYearPublished: 1980,
      toYearPublished: new Date().getFullYear(),
    });
  };
  return (
    <div>
      <div className="flex items-center lg:w-8/12  pt-5 px-5 lg:px-10 gap-1">
        <div className={`dropdown dropdown-bottom mr-5`}>
          <div
            tabIndex={0}
            role="button"
            onClick={(event) => {
              if (filterDropdown.isOpen) {
                (document?.activeElement as HTMLElement).blur();

                filterDropdown.close();
              } else {
                filterDropdown.open();
              }
            }}
            className="rounded-btn p-0 text-sm  normal-case focus:bg-none font-normal flex items-center gap-1"
          >
            <MdFilterList className="text-xl lg:text-2xl" />
          </div>
          <ul className="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-80 mt-4">
            <li>
              <div className="flex flex-col items-start gap-1 px-2  py-1">
                <label className="text-sm">Collection</label>
                <CustomSelect
                  onChange={handleCollectionSelect}
                  options={collections}
                  isMulti={true}
                  value={collections?.filter((c) =>
                    filterParams?.collections.includes(c.id)
                  )}
                  getOptionLabel={(opt) => opt.name}
                  getOptionValue={(opt) => opt.id?.toString() ?? ""}
                  placeholder="Select Collection"
                />
              </div>
            </li>

            <li>
              <div className="flex flex-col items-start gap-1 px-2  py-1">
                <label className="text-sm">Subject Tags</label>
                <CustomSelect
                  onChange={handleTagSelect}
                  value={filterParams?.tags.map((t: string) => ({
                    label: t,
                    value: t,
                  }))}
                  options={tags?.map((t) => ({ label: t, value: t }))}
                  getOptionLabel={(opt) => opt.label}
                  getOptionValue={(opt) => opt.value?.toString() ?? ""}
                  isMulti={true}
                  placeholder="Select Subject"
                />
              </div>
            </li>
            <li>
              <div className="flex flex-col items-start gap-1 px-2  py-1">
                <label className="text-sm">Year Published From</label>
                <CustomDatePicker
                  onChange={handleFrom}
                  selected={new Date(filterParams?.fromYearPublished, 0, 24)}
                  dateFormat="yyyy"
                  showYearPicker
                  yearItemNumber={9}
                />
              </div>
            </li>
            <li>
              <div className="flex flex-col items-start gap-1 px-2 py-1">
                <label className="text-sm">Year Published To</label>
                <CustomDatePicker
                  onChange={handleTo}
                  dateFormat="yyyy"
                  selected={new Date(filterParams?.toYearPublished, 0, 24)}
                  showYearPicker
                  value={filterParams?.toYearPublished}
                  yearItemNumber={9}
                />
              </div>
            </li>
            <li>
              <div className="flex flex-col">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={resetFilter}
                >
                  Reset Filter
                </button>
              </div>
            </li>
          </ul>
        </div>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          onChange={handleSearch}
          onKeyDown={handleKeydown}
          placeholder="Search by title, subject ,description or authors"
          defaultValue={filterParams?.keyword}
        ></input>
       
      </div>
      <LoadingBoundaryV2 isError={isError} isLoading={isFetching}>
        <div className="w-full grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 p-5 lg:p-10 ">
          {books?.map((book) => {
            let bookCover = "";
            if (book.covers.length > 0) {
              bookCover = buildS3Url(book.covers[0]);
            }
            const isEbook = book.ebook.length > 0;
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
                    <div>
                      <p className="text-xs md:text-sm text-success font-semibold">
                        Available
                      </p>
                      {isEbook && (
                        <span className="badge text-xs bg-primary border-none">
                          Ebook
                        </span>
                      )}
                    </div>
                  )}
                  {!isBookAvailable && book.ebook.length == 0 && (
                    <div>
                      <p className="font-semibold text-xs md:text-sm text-warning">
                        Unavailable
                      </p>
                      {isEbook && (
                        <span className="badge text-xs bg-primary border-none">
                          Ebook
                        </span>
                      )}
                    </div>
                  )}
                  {book.section.isNonCirculating && (
                    <div>
                      <span className="badge text-xs bg-gray-500 text-white border-none">
                        Non-circulating
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </LoadingBoundaryV2>
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
  );
};

export default Catalog;
