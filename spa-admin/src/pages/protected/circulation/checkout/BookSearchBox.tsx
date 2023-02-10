import { InputClasses } from "@components/forms/Forms";
import axiosClient from "@definitions/configs/axios";
import { Book } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import Downshift from "downshift";
import { BaseSyntheticEvent, useState } from "react";
import { ClipLoader } from "react-spinners";

type BookSearchBoxProps = {
  selectBook: (book: Book) => void;
};
const BookSearchBox = ({ selectBook }: BookSearchBoxProps) => {
  const [searchKeyword, setKeyword] = useState("");
  const debounce = useDebounce();
  const DELAY_IN_MILLISECOND = 500;
  const handleSearchBoxChange = (event: BaseSyntheticEvent) => {
    debounce(() => setKeyword(event.target.value), null, DELAY_IN_MILLISECOND);
  };
  const fetchBooks = async () => {
    try {
      const { data: response } = await axiosClient.get("/books/", {
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
      <Downshift>
        {({ getInputProps, isOpen, closeMenu }) => (
          <div className="w-10/12  relative ">
            <label className={InputClasses.LabelClasslist}>Search book</label>
            <input
              {...getInputProps({
                placeholder: "Enter book's title or description",
                onChange: handleSearchBoxChange,
                className: InputClasses.InputDefaultClasslist,
              })}
            />

            {isOpen && books.length > 0 ? (
              !isRefetching ? (
                <ul className="w-full absolute list-none max-h-80 bg-white overflow-y-auto cursor-pointer border mt-2 rounded">
                  {books?.map((book) => {
                    const authors = book.authors?.map((author) => {
                      return `${author.givenName} ${author.surname}`;
                    });

                    return (
                      <li
                        key={book.id}
                        className="p-3 border flex flex-col"
                        onClick={() => {
                          closeMenu(() => {
                            selectBook(book);
                          });
                        }}
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
    </>
  );
};
export default BookSearchBox;
