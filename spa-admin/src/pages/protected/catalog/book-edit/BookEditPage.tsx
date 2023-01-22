import { useEffect, useState } from "react";
import Autocomplete from "@components/autocomplete-input/Autocomplete";
import { BaseProps } from "@definitions/props.definition";

import useDebounce from "@hooks/useDebounce";

import {} from "@components/forms/Forms";

import "react-datepicker/dist/react-datepicker.css";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";

import Modal from "react-responsive-modal";
import { ModalProps } from "@definitions/types";
import { BookEditFormProvider } from "./BookEditFormContext";
import BookAddForm from "./BookEditForm";
interface BookAddFormProps extends BaseProps {
  selectedBookSuggestion: BookSuggestion;
}

interface BookSuggestion {
  title: string;
  key: string;
  author_name: string[];
  cover: string;
  ddc: string[];
}
const BookAdd = () => {
  const ONE_SECOND = 1000;
  const [bookSuggestions, setBookSuggestions] = useState<BookSuggestion[]>([]);
  const typingDebounce = useDebounce();
  const [selectedBookSuggestion, setSelectedBookSuggestion] =
    useState<BookSuggestion>({
      key: "",
      title: "",
      author_name: [],
      cover: "",
      ddc: [],
    });

  // const searchBookByTitle = async (value: any) => {
  //   if (value.length === 0) {
  //     setBookSuggestions(() => []);
  //     return;
  //   }
  //   const query = constructQuery(value);
  //   const { data } = await axios.get(
  //     `http://openlibrary.org/search.json?title=${query}`
  //   );
  //   setBookSuggestions(() => data.docs);
  // };

  // const handleSearchOnChange = (event: BaseSyntheticEvent) => {
  //   const value = event.target.value;
  //   typingDebounce(searchBookByTitle, value, ONE_SECOND);
  // };
  const handleSearchResultClick = (bookSuggestion: BookSuggestion) => {
    setSelectedBookSuggestion({ ...bookSuggestion });
  };

  return (
    <BookEditFormProvider>
      {/* <h1 className="text-3xl font-bold">New Book</h1> */}
      <div>
        {/* <select className="w-44 border rounded border-gray-300 h-11">
          <option value={"title"}>Title</option>
          <option value={"author"}>Author</option>
          <option value={"all"}>All</option>
        </select> */}
        {/* <div className="w-7/12 flex flex-col items-end">
          <Autocomplete
            className="w-full indent-1 h-11 border rounded border-gray-300"
            placeholder="Search books on openlibrary.org"
            onInput={handleSearchOnChange}
          >
            {bookSuggestions?.map((bkSuggestion) => {
              return (
                <li
                  key={bkSuggestion.key}
                  onClick={() => {
                    handleSearchResultClick(bkSuggestion);
                  }}
                  className="p-4 w-full cursor-pointer border flex items-center rounded"
                >
                  <span className="ml-1">{bkSuggestion.title}</span>
                </li>
              );
            })}
          </Autocomplete>
        </div> */}
        {/* <button className="border border-gray-200 px-6 h-11 bg-blue-600 text-white rounded">
          Add to collection
        </button> */}
      </div>
      <BookAddForm></BookAddForm>
    </BookEditFormProvider>
  );
};

interface AuthorNumberModalProps extends ModalProps {}
const AuthorNumberModal = ({ isOpen, closeModal }: AuthorNumberModalProps) => {
  return (
    <>
      <Modal
        open={isOpen}
        onClose={closeModal}
        center
        showCloseIcon={false}
        styles={{
          modal: {
            maxWidth: "none",
          },
        }}
        classNames={{
          modal: "w-8/12 rounded ",
        }}
      >
        <div>
          <div className="mb-3">
            <h3 className="text-2xl"> Authors</h3>
          </div>
          <Table>
            <Thead>
              <HeadingRow>
                <Th></Th>
                <Th>Given name</Th>
                <Th>Middle name/initial</Th>
                <Th>Surname</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              return (
              <BodyRow className="cursor-pointer">
                <Td>
                  <input
                    type="checkbox"
                    onChange={() => {}}
                    className="h-4 w-4 border"
                  />
                </Td>
              </BodyRow>
              );
            </Tbody>
          </Table>
        </div>
      </Modal>
    </>
  );
};

export default BookAdd;
