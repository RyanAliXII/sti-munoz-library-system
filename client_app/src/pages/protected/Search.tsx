import React, { BaseSyntheticEvent, useState } from "react";
import HeaderIcon from "@assets/images/library-icon.svg";
import { Link, useNavigate } from "react-router-dom";
import { useRequest } from "@hooks/useRequest";
import useDebounce from "@hooks/useDebounce";
import { Book } from "@definitions/types";
import { useQuery } from "@tanstack/react-query";
import Downshift from "downshift";
import { ClipLoader } from "react-spinners";

const HIGHLIGHTED_CLASS = "bg-gray-100";
const Search = () => {
  const [searchKeyword, setKeyword] = useState("");
  const debounce = useDebounce();
  const DELAY_IN_MILLISECOND = 500;
  const handleSearchBoxChange = (event: BaseSyntheticEvent) => {
    debounce(() => setKeyword(event.target.value), null, DELAY_IN_MILLISECOND);
  };
  const { Get } = useRequest();
  const fetchBooks = async () => {
    try {
      const { data: response } = await Get("/books/", {
        params: {
          offset: 0,
          keyword: searchKeyword,
        },
      });
      return response?.data?.books ?? [];
    } catch {
      return [];
    }
  };
  const { data: books, isRefetching } = useQuery<Book[]>({
    refetchOnMount: false,
    initialData: [],
    queryKey: ["books", searchKeyword],
    queryFn: fetchBooks,
  });

  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-col justify-center items-center h-64  mt-32 gap-3">
      <div>
        <img src={HeaderIcon} alt="library-logo" className="w-28 ml-2"></img>
      </div>
      <div className="w-11/12 md:w-8/12" style={{ maxWidth: "826px" }}>
        <Downshift
          itemToString={(book) => (book ? book.title : "")}
          onChange={(book) => {
            navigate(`/catalog/${book?.id}`);
          }}
        >
          {({
            getInputProps,
            isOpen,
            getMenuProps,
            getItemProps,
            highlightedIndex,
          }) => (
            <div className=" relative ">
              <input
                {...getInputProps({
                  placeholder: "Search Book",
                  onChange: handleSearchBoxChange,
                  className: "input input-bordered w-full ",
                })}
              />

              {isOpen && books.length > 0 ? (
                !isRefetching ? (
                  <ul
                    {...getMenuProps({
                      className:
                        "w-full absolute list-none max-h-80 bg-white overflow-y-auto cursor-pointer border mt-2 rounded z-10",
                    })}
                  >
                    {books?.map((book, index) => {
                      const authors = book.authors.map((a) => a.name);
                      return (
                        <li
                          {...getItemProps({
                            key: book.id,
                            item: book,
                            className: `p-3 border flex flex-col ${
                              index === highlightedIndex
                                ? HIGHLIGHTED_CLASS
                                : ""
                            }`,
                          })}
                        >
                          <span className="text-gray-600">{book.title}</span>
                          <small className="text-gray-400">
                            ISBN: {book.isbn} | Authors: {authors.join(", ")}
                          </small>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="w-full absolute list-none h-52 overflow-y-auto cursor-pointer items-center flex justify-center bg-white border rounded mt-2">
                    <ClipLoader color="#C5C5C5" />
                  </div>
                )
              ) : null}

              {isOpen && books.length === 0 ? (
                <div className="w-full absolute list-none h-52 bg-white overflow-y-auto cursor-pointer border mt-2 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-sm">
                    No result found for {searchKeyword}
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </Downshift>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-primary"
          // className="py-1.5 px-4 text-xs bg-blue-500 text-white rounded md:py-2.5 md:px-5 md:text-sm"
        >
          Search
        </button>
        <Link
          to="/catalog"
          className="btn btn-outline"
          // className="py-1.5 px-4 text-xs border text-gray-400 rounded md:py-2.5 md:px-5 md:text-sm"
        >
          Browse
        </Link>
      </div>
    </div>
  );
};

export default Search;
