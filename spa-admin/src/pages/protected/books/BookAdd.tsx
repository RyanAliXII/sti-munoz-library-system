import axios from "axios";
import React, { BaseSyntheticEvent, useId, useState } from "react";
import Autocomplete from "../../../components/autocomplete-input/Autocomplete";
import { BaseProps } from "../../../definitions/props.definition";
import { constructQuery } from "../../../helpers/helper";
import useDebounce from "../../../hooks/useDebounce";
import {
  DangerButton,
  Input,
  InputClasses,
  PrimaryButton,
  SecondaryButton,
  Select,
} from "../../../components/forms/Forms";
import { useForm } from "../../../hooks/useForm";
import { CategorySchema } from "./schema";
import { Editor } from "@tinymce/tinymce-react";
import DatePicker from "react-datepicker";
import { Author } from "../../../definitions/types";
import "react-datepicker/dist/react-datepicker.css";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
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
            <Select
              labelText="Category"
              options={[
                { name: "test", id: 1 },
                { name: "test 2", id: 2 },
              ]}
              idKey="id"
              textKey="name"
            ></Select>
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
              className={InputClasses.InputDefaultClasslist}
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
            <PrimaryButton type="button" className="mt-2 ">
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
            <PrimaryButton type="button" className="mt-2 ">
              <RiAddLine />
            </PrimaryButton>
            <SecondaryButton type="button" className="mt-2 ">
              <AiOutlineSearch />
            </SecondaryButton>
          </div>
        </div>
        <h2 className="mt-10 text-2xl">Author and Details</h2>
        <hr className="mb-5"></hr>
        <div className="flex gap-2 mb-5 ">
          <PrimaryButton type="button" onClick={openAuthorModal}>
            Select Author
          </PrimaryButton>
          <SecondaryButton type="button">Add Author</SecondaryButton>
        </div>

        <div className="mb-10 overflow-y-scroll h-64">
          <Table className="w-full">
            <Thead className=" sticky top-0">
              <HeadingRow>
                <Th>Given name</Th>
                <Th>Middle name/initial</Th>
                <Th>Surname</Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {form.authors?.map((author) => {
                return (
                  <BodyRow key={author.id ?? useId()}>
                    <Td>{author.givenName}</Td>
                    <Td>{author.middleName}</Td>
                    <Td>{author.surname}</Td>
                    <Td className="p-2 flex gap-2 items-center justify-center h-full">
                      {!author.id && (
                        <SecondaryButton
                          className="flex items-center gap-1 text-sm"
                          // onClick: openEditModal,
                        >
                          <AiOutlineEdit />
                        </SecondaryButton>
                      )}
                      <DangerButton
                        className=" bg-red-500 flex items-center gap-1 text-sm"
                        onClick={() => {
                          removeAuthorFromTable(author);
                        }}
                      >
                        <AiOutlineDelete />
                      </DangerButton>
                    </Td>
                  </BodyRow>
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
          <PrimaryButton type="button">Add Authors</PrimaryButton>
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
              <HeadingRow>
                <Th></Th>
                <Th>Given name</Th>
                <Th>Middle name/initial</Th>
                <Th>Surname</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {authors?.map((author) => {
                const isChecked = selectedAuthors.find(
                  (a) => a.id === author.id
                );

                return (
                  <BodyRow
                    key={author.id}
                    className="cursor-pointer"
                    onClick={() => {
                      if (!isChecked) {
                        selectAuthor?.(author);
                      } else {
                        removeAuthor?.(author);
                      }
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
                  </BodyRow>
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
