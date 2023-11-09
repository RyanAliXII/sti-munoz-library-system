import { InputClasses } from "@components/ui/form/Input";

import { Book } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import Downshift from "downshift";
import { BaseSyntheticEvent, useState } from "react";
import { ClipLoader } from "react-spinners";

type BookSearchBoxProps = {
  selectBook: (book: Book) => void;
  label?: string;
};

const HIGHLIGHTED_CLASS = "bg-gray-100 dark:bg-gray-600";
const BookSearchBox = ({ selectBook, label }: BookSearchBoxProps) => {
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
  return (
    <>
      <Downshift
        itemToString={(book) => (book ? book.title : "")}
        onChange={(book) => {
          selectBook(book);
        }}
      >
        {({
          getInputProps,
          isOpen,
          getMenuProps,
          getItemProps,
          highlightedIndex,
        }) => (
          <div className="w-10/12  relative ">
            {label && (
              <label className={InputClasses.LabelClasslist}>{label}</label>
            )}
            <input
              {...getInputProps({
                placeholder: "Enter book's title or description",
                onChange: handleSearchBoxChange,
                className:
                  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
              })}
            />

            {isOpen && books.length > 0 ? (
              !isRefetching ? (
                <ul
                  {...getMenuProps({
                    className:
                      "w-full absolute list-none max-h-80 bg-white overflow-y-auto cursor-pointer border mt-2 rounded z-10 dark:bg-gray-700 dark:border-gray-600 small-scroll",
                  })}
                >
                  {books?.map((book, index) => {
                    const authors = book.authors?.map((a) => a.name);
                    return (
                      <li
                        {...getItemProps({
                          key: book.id,
                          item: book,
                          className: `p-3 border flex dark:border-gray-600 flex-col ${
                            index === highlightedIndex ? HIGHLIGHTED_CLASS : ""
                          }`,
                        })}
                      >
                        <span className="text-gray-600 dark:text-gray-100">
                          {book.title}
                        </span>
                        <small className="text-gray-300">
                          ISBN: {book.isbn} | Authors: {authors.join(", ")}
                        </small>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="w-full absolute list-none h-52 overflow-y-auto cursor-pointer items-center flex justify-center bg-white border rounded mt-2 dark:bg-gray-700">
                  <ClipLoader color="#C5C5C5" />
                </div>
              )
            ) : null}

            {isOpen && books.length === 0 ? (
              <div className="w-full absolute list-none h-52 bg-white overflow-y-auto cursor-pointer border mt-2 rounded flex items-center justify-center dark:bg-gray-700 dark:border-none">
                <span className="text-gray-400 text-sm">
                  No result found for {searchKeyword}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </Downshift>
    </>
  );
};
export default BookSearchBox;
