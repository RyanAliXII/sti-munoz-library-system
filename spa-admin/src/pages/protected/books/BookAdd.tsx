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
} from "../../../components/forms/Forms";
import { useForm } from "../../../hooks/useForm";
import { BookSchema, CategorySchema } from "./schema";
import { Editor } from "@tinymce/tinymce-react";
import DatePicker from "react-datepicker";
import {
  Author,
  CategoryType,
  PublisherType,
  SourceType,
} from "../../../definitions/types";
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
import { toast } from "react-toastify";
import Select, { Props as ReactSelectProps } from "react-select";
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
// const obj: ReactSelectProps = {
//   styles: {
//     control: (baseStyles) => ({
//       ...baseStyles,
//       borderColor: "none",
//       boxShadow: "none",
//     }),
//     option: (baseStyles) => ({
//       ...baseStyles,
//       backgroundColor: "none",
//     }),
//   },
//   classNames: {
//     control: (props) => {
//       return errors?.category
//         ? `${InputClasses.InputBorderClasslist} ${InputClasses.InputErrorClassList}`
//         : InputClasses.InputBorderClasslist;
//     },
//     option: (props) => {
//       return props.isSelected ? "bg-yellow-400" : "";
//     },
//   },
// };
const BookAddForm: React.FC<BookAddFormProps> = ({}) => {
  const {
    isOpen: isAuthorModalOpen,
    close: closeAuthorModal,
    open: openAuthorModal,
  } = useSwitch();

  const { form, handleFormInput, setForm, validate, errors } = useForm<
    Omit<BookType, "id">
  >({
    default: {
      title: "",
      authors: [],
      category: "",
      copies: 0,
      dateReceived: new Date(),
      authorNumber: "",
      ddc: "",
      costPrice: 0,
      description: "",
      fundSource: 0,
      edition: 0,
      pages: 0,
      publisher: 0,
      year: 2000,
    },
    schema: BookSchema,
  });

  const fetchPublishers = async () => {
    try {
      const { data: response } = await axiosClient.get("/publishers/");
      return response.data?.publishers ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const fetchSourceofFunds = async () => {
    try {
      const { data: response } = await axiosClient.get("/source-of-funds/");
      return response.data?.sources ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const fetchCategories = async () => {
    try {
      const { data: response } = await axiosClient.get("/categories/");
      return response.data?.categories ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const { data: publishers } = useQuery<PublisherType[]>({
    queryFn: fetchPublishers,
    queryKey: ["publishers"],
  });
  const { data: sourceOfFunds } = useQuery<SourceType[]>({
    queryFn: fetchSourceofFunds,
    queryKey: ["sources"],
  });
  const { data: categories } = useQuery<CategoryType[]>({
    queryFn: fetchCategories,
    queryKey: ["categories"],
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
    toast.success(`${a.givenName} ${a.surname} has been removed.`);
  };
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      console.log("SUBMITTED");
      await validate();
    } catch {}
  };
  return (
    <div>
      <h2 className="text-2xl">General Information</h2>
      <hr className="mb-5"></hr>
      <form onSubmit={submit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
          <div>
            <Input
              labelText="Title"
              error={errors?.title}
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
              error={errors?.copies}
              props={{
                type: "number",
                min: 0,
                max: 1000,
                value: form.copies,
                onChange: handleFormInput,
                placeholder: "Number of copies",
                name: "copies",
              }}
            />
          </div>
          <div>
            <Input
              labelText="Pages"
              error={errors?.pages}
              props={{
                type: "number",
                min: 0,
                max: 1000,
                value: form.pages,
                onChange: handleFormInput,
                placeholder: "Number of pages",
                name: "pages",
              }}
            />
          </div>
          <div>
            <label>Category</label>
            <Select
              styles={{
                control: (baseStyles) => ({
                  ...baseStyles,
                  borderColor: "none",
                  boxShadow: "none",
                }),
                option: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "none",
                }),
              }}
              classNames={{
                control: (props) => {
                  return errors?.category
                    ? `${InputClasses.InputBorderClasslist} ${InputClasses.InputErrorClassList}`
                    : InputClasses.InputBorderClasslist;
                },
                option: (props) => {
                  return props.isSelected ? "bg-yellow-400" : "";
                },
              }}
              options={categories?.map((category) => {
                return {
                  value: category.name,
                  label: category.name.toLocaleUpperCase(),
                };
              })}
            ></Select>
            <div className={InputClasses.LabelWrapperClasslist}>
              <small className={InputClasses.LabelClasslist}>
                {errors?.category}
              </small>
            </div>
          </div>
          <div>
            <label>Source of fund</label>
            <Select
              options={sourceOfFunds?.map((source) => {
                return { value: source.id, label: source.name };
              })}
            ></Select>
            <div className={InputClasses.LabelWrapperClasslist}>
              <small className={InputClasses.LabelClasslist}>
                {errors?.fundSource}
              </small>
            </div>
          </div>
          <div>
            <Input
              labelText="Cost Price"
              error={errors?.costPrice}
              props={{
                type: "number",
                min: 0,
                max: 1000,
                value: form.costPrice,
                onChange: handleFormInput,
                placeholder: "Book copies",
                name: "costPrice",
              }}
            />
          </div>
          <div>
            <Input
              labelText="Edition"
              error={errors?.edition}
              props={{
                type: "number",
                min: 0,
                max: 1000,
                value: form.edition,
                onChange: handleFormInput,
                placeholder: "Book copies",
                name: "edition",
              }}
            />
          </div>
          <div>
            <label> Publisher</label>
            <Select
              options={publishers?.map((publisher) => {
                return { value: publisher.id, label: publisher.name };
              })}
            ></Select>
            <div className={InputClasses.LabelWrapperClasslist}>
              <small className={InputClasses.LabelClasslist}>
                {errors?.publisher}
              </small>
            </div>
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

                // value: form.copies
                // onChange: handleFormInput,
                name: "dateReceived",
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
                error={errors?.ddc}
                props={{
                  value: form.ddc,
                  onChange: handleFormInput,
                  placeholder: "Book classification",
                  name: "ddc",
                }}
              />
            </div>
            <PrimaryButton type="button" className="mt-2 bg-gray-500">
              <AiOutlineSearch />
            </PrimaryButton>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex flex-col flex-grow">
              <Input
                labelText="Cutter-Sanborn number"
                error={errors?.authorNumber}
                props={{
                  value: form.authorNumber,
                  onChange: handleFormInput,
                  placeholder: "Author number",
                  name: "authorNumber",
                }}
              />
            </div>
            <PrimaryButton type="button" className="mt-2 bg-gray-500 ">
              <RiAddLine />
            </PrimaryButton>
            <SecondaryButton type="button" className="mt-2 bg-gray-300 ">
              <AiOutlineSearch />
            </SecondaryButton>
          </div>
        </div>
        <h2 className="mt-10 text-2xl">Author and Details</h2>
        <hr className="mb-5"></hr>
        <div className="flex gap-3 mb-5 ">
          <span
            className=" text-blue-500 text-sm underline underline-offset-1 cursor-pointer"
            onClick={openAuthorModal}
          >
            Select Authors
          </span>
          {/* <PrimaryButton type="button" onClick={openAuthorModal}>
       
          </PrimaryButton> */}
          <span className=" text-yellow-400 text-sm cursor-pointer ">
            Add Author
          </span>
          {/* <SecondaryButton type="button"></SecondaryButton> */}
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
                        <AiOutlineEdit className="cursor-pointer text-yellow-400 text-xl" />
                      )}

                      <AiOutlineDelete
                        className="cursor-pointer text-orange-600  text-xl"
                        onClick={() => {
                          removeAuthorFromTable(author);
                        }}
                      />
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
          <PrimaryButton type="submit">Add to Collection</PrimaryButton>
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
type BookType = {
  id: string;
  title: string;
  copies: number;
  edition: number;
  costPrice: number;
  fundSource: number;
  publisher: number;
  pages: number;
  year: number;
  dateReceived: Date;
  category: string;
  authorNumber: string;
  ddc: string;
  authors: Author[];
  description: string;
};
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
