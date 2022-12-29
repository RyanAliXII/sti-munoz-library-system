import axios from "axios";
import React, { BaseSyntheticEvent, useEffect, useId, useState } from "react";
import Autocomplete from "../../../components/autocomplete-input/Autocomplete";
import { BaseProps } from "../../../definitions/props.definition";
import { constructQuery, falsyValidate } from "../../../helpers/helper";
import useDebounce from "../../../hooks/useDebounce";
import {
  DangerButton,
  DANGER_BTN_DEFAULT_CLASS,
  Input,
  INPUT_DEFAULT_CLASS,
  PrimaryButton,
  PRIMARY_BTN_DEFAULT_CLASS,
  SecondaryButton,
  SECONDARY_BTN_DEFAULT_CLASS,
} from "../../../components/forms/Forms";
import { useForm } from "../../../hooks/useForm";
import { CategorySchema } from "./schema";
import { Editor } from "@tinymce/tinymce-react";
import DatePicker from "react-datepicker";
import { Author } from "../../../definitions/types";
import "react-datepicker/dist/react-datepicker.css";
import {
  DEFAULT_THEAD_CLASS,
  Table,
  TABLE_BODY_ROW_DEFAULT_CLASS,
  Tbody,
  Td,
  Th,
  Thead,
  TrBody,
  TrHead,
} from "../../../components/table/Table";
import { useSwitch } from "../../../hooks/useToggle";
import Modal from "react-responsive-modal";
import { ModalProps } from "../../../definitions/types";
import { useQuery } from "@tanstack/react-query";
import axiosClient from "../../../definitions/configs/axios";
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineSearch,
} from "react-icons/ai";
import { RiAddLine } from "react-icons/ri";

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

  const searchBookByTitle = async (value: any) => {
    if (value.length === 0) {
      setBookSuggestions(() => []);
      return;
    }
    const query = constructQuery(value);
    const { data } = await axios.get(
      `http://openlibrary.org/search.json?title=${query}`
    );
    setBookSuggestions(() => data.docs);
  };

  const handleSearchOnChange = (event: BaseSyntheticEvent) => {
    const value = event.target.value;
    typingDebounce(searchBookByTitle, value, ONE_SECOND);
  };
  const handleSearchResultClick = (bookSuggestion: BookSuggestion) => {
    setSelectedBookSuggestion({ ...bookSuggestion });
  };
  return (
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto">
      <h1 className="text-3xl font-bold">New Book</h1>
      <div className="w-9/12 ml-9 mt-6 flex items-center gap-2">
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
      <BookAddForm
        selectedBookSuggestion={selectedBookSuggestion}
      ></BookAddForm>
    </div>
  );
};

const BookAddForm: React.FC<BookAddFormProps> = ({}) => {
  const {
    isOpen: isAuthorModalOpen,
    close: closeAuthorModal,
    open: openAuthorModal,
  } = useSwitch();

  const { form, handleFormInput, setForm } = useForm<Book>({
    default: {
      title: "",
      copies: 1,
      costPrice: 0,
      ddc: "",
      cutterNumber: "",
      authors: [],
      sourceOfFund: 0,
      publisher: 0,
    },
    schema: CategorySchema,
  });
  const selectAuthorFromTable = (a: Author) => {
    setForm((prevForm) => {
      return {
        ...prevForm,
        authors: [...(prevForm?.authors ?? []), a],
      };
    });
  };
  const removeAuthorFromTable = (a: Author) => {
    setForm((prevForm) => {
      const filtered =
        prevForm.authors?.filter((author) => author.id != a.id) ?? [];
      return {
        ...prevForm,
        authors: [...filtered],
      };
    });
  };

  return (
    <div>
      <h2 className="text-2xl">General Information</h2>
      <hr className="mb-5"></hr>
      <form>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
          <div>
            <Input
              labelText="Title"
              props={{
                value: form.title,
                onChange: handleFormInput,
                placeholder: "Book title",
                name: "title",
              }}
            />
          </div>
          <div>
            <Input
              labelText="Copies"
              props={{
                type: "number",
                min: 1,
                max: 1000,
                value: form.copies,
                onChange: handleFormInput,
                placeholder: "Book copies",
                name: "copies",
              }}
            />
          </div>
          <div>
            <Input
              labelText="Pages"
              props={{
                type: "number",
                min: 1,
                max: 1000,
                value: form.copies,
                onChange: handleFormInput,
                placeholder: "Book copies",
                name: "copies",
              }}
            />
          </div>
          <div>
            <label>Category</label>
            <select className={INPUT_DEFAULT_CLASS}>
              <option>Select Category</option>
            </select>
          </div>
          <div>
            <Input
              labelText="Source of funds"
              props={{
                type: "number",
                min: 1,
                max: 1000,
                value: form.copies,
                onChange: handleFormInput,
                placeholder: "Book copies",
                name: "copies",
              }}
            />
          </div>
          <div>
            <Input
              labelText="Cost Price"
              props={{
                type: "number",
                min: 1,
                max: 1000,
                value: form.copies,
                onChange: handleFormInput,
                placeholder: "Book copies",
                name: "copies",
              }}
            />
          </div>
          <div>
            <Input
              labelText="Edition"
              props={{
                type: "number",
                min: 1,
                max: 1000,
                value: form.copies,
                onChange: handleFormInput,
                placeholder: "Book copies",
                name: "copies",
              }}
            />
          </div>
          <div>
            <Input
              labelText="Publisher"
              props={{
                type: "number",
                min: 1,
                max: 1000,
                value: form.copies,
                onChange: handleFormInput,
                placeholder: "Book copies",
                name: "copies",
              }}
            />
          </div>
          <div>
            <label>Year Published</label>
            <DatePicker
              className={INPUT_DEFAULT_CLASS}
              selected={new Date()}
              onChange={(date) => {
                console.log(date);
              }}
              showYearPicker
              dateFormat="yyyy"
              yearItemNumber={9}
            />
          </div>

          <div>
            <Input
              labelText="Date received"
              props={{
                type: "date",

                // value: form.copies,
                // onChange: handleFormInput,
                placeholder: "Book copies",
                name: "",
              }}
            />
          </div>
        </div>
        <h3 className="text-lg mt-10">DDC and Author number</h3>
        <hr className="mb-5"></hr>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
          <div className="flex items-center gap-1">
            <div className="flex flex-col flex-grow">
              <Input
                labelText="Dewey Decimal Class"
                props={{
                  value: form.ddc,
                  onChange: handleFormInput,
                  placeholder: "Book classification",
                  name: "ddc",
                }}
              />
            </div>
            <PrimaryButton
              props={{
                type: "button",
                className: `${PRIMARY_BTN_DEFAULT_CLASS} mt-2 `,
              }}
            >
              <AiOutlineSearch />
            </PrimaryButton>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex flex-col flex-grow">
              <Input
                labelText="Cutter-Sanborn number"
                props={{
                  value: form.ddc,
                  onChange: handleFormInput,
                  placeholder: "Author number",
                  name: "ddc",
                }}
              />
            </div>
            <PrimaryButton
              props={{
                type: "button",
                className: `${PRIMARY_BTN_DEFAULT_CLASS} mt-2 `,
              }}
            >
              <RiAddLine />
            </PrimaryButton>
            <SecondaryButton
              props={{
                type: "button",
                className: `${SECONDARY_BTN_DEFAULT_CLASS} mt-2 `,
              }}
            >
              <AiOutlineSearch />
            </SecondaryButton>
          </div>
        </div>
        <h2 className="mt-10 text-2xl">Author and Details</h2>
        <hr className="mb-5"></hr>
        <div className="flex gap-2 mb-5 ">
          <PrimaryButton props={{ type: "button", onClick: openAuthorModal }}>
            Select Author
          </PrimaryButton>
          <SecondaryButton props={{ type: "button" }}>
            Add Author
          </SecondaryButton>
        </div>

        <div className="mb-10 overflow-y-scroll h-64">
          <Table props={{ className: "w-full" }}>
            <Thead props={{ className: `${DEFAULT_THEAD_CLASS} sticky top-0` }}>
              <TrHead>
                <Th>Given name</Th>
                <Th>Middle name/initial</Th>
                <Th>Surname</Th>
                <Th></Th>
              </TrHead>
            </Thead>
            <Tbody props={{ className: "" }}>
              {form.authors?.map((author) => {
                return (
                  <TrBody key={author.id ?? useId()}>
                    <Td>{author.givenName}</Td>
                    <Td>{author.middleName}</Td>
                    <Td>{author.surname}</Td>
                    <Td
                      props={{
                        className:
                          "p-2 flex gap-2 items-center justify-center h-full",
                      }}
                    >
                      {!author.id && (
                        <SecondaryButton
                          props={{
                            className: `${SECONDARY_BTN_DEFAULT_CLASS} flex items-center gap-1 text-sm`,
                            // onClick: openEditModal,
                          }}
                        >
                          <AiOutlineEdit />
                        </SecondaryButton>
                      )}
                      <DangerButton
                        props={{
                          className: `${DANGER_BTN_DEFAULT_CLASS} bg-red-500 flex items-center gap-1 text-sm`,
                          onClick: () => {
                            removeAuthorFromTable(author);
                          },
                        }}
                      >
                        <AiOutlineDelete />
                      </DangerButton>
                    </Td>
                  </TrBody>
                );
              })}
            </Tbody>
          </Table>
        </div>
        <div className="mb-5">
          <label>Description</label>
          <div>
            <Editor apiKey="dj5q6q3r4r8f9a9nt139kk6ba97ntgvdn3iiobqmeef4k4ei" />
          </div>
        </div>
        <div className="mb-2">
          <PrimaryButton props={{ type: "button" }}>Add Authors</PrimaryButton>
        </div>
      </form>

      <AuthorModal
        closeModal={closeAuthorModal}
        isOpen={isAuthorModalOpen}
        selectAuthor={selectAuthorFromTable}
        removeAuthor={removeAuthorFromTable}
        selectedAuthors={form.authors?.filter((a) => a.id) ?? []}
      ></AuthorModal>
    </div>
  );
};
interface AuthorModalProps extends ModalProps {
  selectAuthor?: (a: Author) => void;
  removeAuthor?: (a: Author) => void;
  selectedAuthors: Author[];
}
const AuthorModal: React.FC<AuthorModalProps> = ({
  closeModal,
  isOpen,
  selectAuthor,
  removeAuthor,
  selectedAuthors,
}) => {
  const fetchAuthors = async () => {
    try {
      const { data: response } = await axiosClient.get("/authors/");
      return response?.data?.authors ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const { data: authors } = useQuery<Author[]>({
    queryFn: fetchAuthors,
    queryKey: ["authors"],
  });
  if (!isOpen) return null;

  const selectedAuthorsCount = selectedAuthors.length;

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
            <small>
              You have selected
              <strong> {selectedAuthorsCount} </strong>
              {selectedAuthorsCount > 1 ? "authors" : "author"}
            </small>
          </div>
          <Table>
            <Thead>
              <TrHead>
                <Th></Th>
                <Th>Given name</Th>
                <Th>Middle name/initial</Th>
                <Th>Surname</Th>
              </TrHead>
            </Thead>
            <Tbody>
              {authors?.map((author) => {
                const isChecked = selectedAuthors.find(
                  (a) => a.id === author.id
                );

                return (
                  <TrBody
                    key={author.id}
                    props={{
                      className: `${TABLE_BODY_ROW_DEFAULT_CLASS} cursor-pointer`,
                      onClick: () => {
                        if (!isChecked) {
                          selectAuthor?.(author);
                        } else {
                          removeAuthor?.(author);
                        }
                      },
                    }}
                  >
                    <Td>
                      <input
                        type="checkbox"
                        onChange={() => {}}
                        checked={isChecked ? true : false}
                        className="h-4 w-4 border"
                      />
                    </Td>
                    <Td>{author.givenName}</Td>
                    <Td>{author.middleName}</Td>
                    <Td>{author.surname}</Td>
                  </TrBody>
                );
              })}
            </Tbody>
          </Table>
        </div>
      </Modal>
    </>
  );
};
interface BookAddFormProps extends BaseProps {
  selectedBookSuggestion: BookSuggestion;
}

interface form {
  title?: string;
  author?: string;
  copies?: number;
  ddc?: string;
  cutterNumber?: string;
}

type Book = {
  title: string;
  description?: string;
  copies: number;
  ddc: string;
  sourceOfFund: number;
  publisher: number;
  costPrice: number;
  cutterNumber: string;
  authors?: Author[];
};

interface BookSuggestion {
  title: string;
  key: string;
  author_name: string[];
  cover: string;
  ddc: string[];
}
export default BookAdd;
