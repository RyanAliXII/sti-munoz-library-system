import {
  Input,
  InputClasses,
  PrimaryButton,
  SecondaryButton,
} from "@components/forms/Forms";
import { useSwitch } from "@hooks/useToggle";
import React, { BaseSyntheticEvent, useId } from "react";
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineSearch,
} from "react-icons/ai";
import { BookSchema } from "../schema";
import {
  Author,
  BookType,
  CategoryType,
  PublisherType,
  SourceType,
} from "@definitions/types";
import { useForm } from "@hooks/useForm";
import axiosClient from "@definitions/configs/axios";
import { useQuery } from "@tanstack/react-query";
import { SingleValue } from "react-select";
import CustomSelect from "@components/forms/CustomSelect";
import CustomDatePicker from "@components/forms/CustomDatePicker";
import { Editor } from "@tinymce/tinymce-react";
import {
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";
import AuthorSelectionModal from "./AuthorSelectionModal";
import SelectedAuthorsTable from "./SelectedAuthorsTable";
import CutterSelectionModal from "./CutterSelectionModal";
import { BookAddContext, BookAddProvider } from "./BookAddContext";

const BookAddForm = () => {
  const {
    isOpen: isAuthorSelectionOpen,
    close: closeAuthorSelection,
    open: openAuthorSelection,
  } = useSwitch();
  const {
    isOpen: isCutterSelectionOpen,
    close: closeCutterSelection,
    open: openCutterSelection,
  } = useSwitch();
  const {
    form,
    handleFormInput,
    setForm,
    validate,
    errors,
    clearErrorWithKey,
  } = useForm<Omit<BookType, "id">>({
    default: {
      title: "",
      authors: [],
      category: "",
      copies: 1,
      dateReceived: new Date().toISOString(),
      authorNumber: "",
      ddc: "",
      costPrice: 0,
      description: "",
      fundSource: 0,
      edition: 0,
      pages: 1,
      publisher: 0,
      year: new Date().getFullYear(),
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
  };
  const handleCategorySelect = (
    option: SingleValue<{ label: string; value: string }>
  ) => {
    if (!option?.value) return;
    clearErrorWithKey("category");
    setForm((prevForm) => ({ ...prevForm, category: option.value }));
  };
  const handleSourceSelect = (
    option: SingleValue<{ label: string; value: number | undefined }>
  ) => {
    if (!option?.value) return;
    clearErrorWithKey("fundSource");
    setForm((prevForm) => ({
      ...prevForm,
      fundSource: option.value as number,
    }));
  };
  const handlePublisherSelect = (
    option: SingleValue<{ label: string; value: number | undefined }>
  ) => {
    if (!option?.value) return;
    clearErrorWithKey("publisher");
    setForm((prevForm) => ({
      ...prevForm,
      publisher: option?.value as number,
    }));
  };

  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      console.log("SUBMITTED");
      await validate();
    } catch {}
  };

  return (
    <BookAddProvider form={form}>
      <form onSubmit={submit}>
        <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto mb-10">
          <h2 className="text-2xl">General Information</h2>
          <hr className="mb-5"></hr>

          <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Title
                </label>
                <small className="text-gray-600 p-1 rounded bg-gray-200">
                  Required
                </small>
              </div>
              <div>
                <small className="text-gray-500 hidden lg:block">
                  The title can be found in the cover of the book.
                </small>
              </div>
            </div>

            <div className="flex h-14 items-center  col-span-7">
              <Input
                wrapperclass="flex flex-col "
                error={errors?.title}
                value={form.title}
                onChange={handleFormInput}
                placeholder="Book title"
                name="title"
              />
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-9 gap-2  lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Copies
                </label>
                <small className="text-gray-600 p-1 rounded bg-gray-200">
                  Required
                </small>
              </div>
              <div>
                <small className="text-gray-500 hidden lg:block pr-5">
                  The default value is 1. The value should not be less than the
                  default.
                </small>
              </div>
            </div>

            <div className="flex h-14 items-center  col-span-7">
              <Input
                wrapperclass="flex flex-col"
                error={errors?.copies}
                type="number"
                value={form.copies}
                onChange={handleFormInput}
                placeholder="Number of copies"
                name="copies"
              />
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-9 gap-2  lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Pages
                </label>
              </div>
              <div>
                {/* <small className="text-gray-500 hidden lg:block">
                  The number of copies of a book.
                </small> */}
              </div>
            </div>

            <div className="flex h-14 items-center col-span-7">
              <Input
                wrapperclass="flex flex-col"
                error={errors?.pages}
                type="number"
                value={form.pages}
                onChange={handleFormInput}
                placeholder="Number of pages"
                name="pages"
              />
              {/* <Input
                error={errors?.copies}
                type="number"
                value={form.copies}
                onChange={handleFormInput}
                placeholder="Number of copies"
                name="copies"
              /> */}
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Category
                </label>
                <small className="text-gray-600 p-1 rounded bg-gray-200">
                  Required
                </small>
              </div>
              <div>
                <small className="text-gray-500 hidden lg:block pr-5">
                  The book will be added to this collection.
                </small>
              </div>
            </div>

            <div className="flex h-14 items-center  col-span-7">
              <CustomSelect
                wrapperclass="w-full flex flex-col"
                onChange={handleCategorySelect}
                className="w-full"
                // label="Category"
                error={errors?.category}
                options={categories?.map((category) => {
                  return {
                    value: category.name,
                    label: category.name.toLocaleUpperCase(),
                  };
                })}
              ></CustomSelect>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Publisher
                </label>
                <small className="text-gray-600 p-1 rounded bg-gray-200">
                  Required
                </small>
              </div>
            </div>

            <div className="flex h-14 items-center  col-span-7">
              <CustomSelect
                wrapperclass="flex flex-col"
                className="w-full"
                onChange={handlePublisherSelect}
                error={errors?.publisher}
                options={publishers?.map((publisher) => {
                  return { value: publisher.id, label: publisher.name };
                })}
              ></CustomSelect>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Source of Fund
                </label>
                <small className="text-gray-600 p-1 rounded bg-gray-200">
                  Required
                </small>
              </div>
              <div>
                <small className="text-gray-500 hidden lg:block pr-5">
                  This refers on how the book is acquired.
                </small>
              </div>
            </div>

            <div className="flex h-14 items-center  col-span-7">
              <CustomSelect
                className="w-full"
                wrapperclass="flex flex-col"
                onChange={handleSourceSelect}
                error={errors?.fundSource}
                options={sourceOfFunds?.map((source) => {
                  return { value: source.id, label: source.name };
                })}
              ></CustomSelect>
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Cost Price
                </label>
              </div>
            </div>

            <div className="flex h-14 items-center  col-span-7">
              <Input
                error={errors?.costPrice}
                type="number"
                value={form.costPrice}
                onChange={handleFormInput}
                placeholder="Book copies"
                name="costPrice"
              />
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Edition
                </label>
              </div>
            </div>

            <div className="flex h-14 items-center  col-span-7">
              <Input
                error={errors?.edition}
                type="number"
                value={form.edition}
                onChange={handleFormInput}
                placeholder="Book copies"
                name="edition"
              />
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Year published
                </label>
                <small className="text-gray-600 p-1 rounded bg-gray-200">
                  Required
                </small>
              </div>
            </div>

            <div className="flex h-14 items-center  col-span-7">
              <CustomDatePicker
                wrapperclass="flex flex-col"
                selected={new Date(form.year, 0, 24)}
                onChange={(date) => {
                  if (!date?.getFullYear()) return;
                  setForm((prevForm) => ({
                    ...prevForm,
                    year: date.getFullYear(),
                  }));
                }}
                showYearPicker
                dateFormat="yyyy"
                yearItemNumber={9}
              />
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Date received
                </label>
              </div>
            </div>

            <div className="flex h-14 items-center col-span-7">
              <CustomDatePicker
                onChange={(date) => {
                  if (!date) return;
                  setForm((prevForm) => ({
                    ...prevForm,
                    dateReceived: date?.toISOString(),
                  }));
                }}
                selected={new Date(form.dateReceived)}
              ></CustomDatePicker>
            </div>
          </div>
          <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  Description
                </label>
              </div>
              <div>
                <small className="text-gray-500 hidden lg:block pr-5">
                  Brief description of the book.
                </small>
              </div>
            </div>

            <div className="col-span-7">
              <Editor apiKey="dj5q6q3r4r8f9a9nt139kk6ba97ntgvdn3iiobqmeef4k4ei" />
            </div>
          </div>
        </div>
        <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto">
          <h2 className="mt-10 text-2xl">Authors and Classification</h2>
          <hr className="mb-5"></hr>
          <div className="flex gap-3 mb-5 ">
            <span
              className=" text-blue-500 text-sm underline underline-offset-1 cursor-pointer font-semibold"
              onClick={openAuthorSelection}
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

          <div
            className="mb-10 overflow-y-auto scroll-smooth"
            style={{ maxHeight: "300px" }}
          >
            {form.authors?.length === 0 ? (
              <div className="flex items-center h-10 justify-center">
                <small className="text-gray-400">No authors selected.</small>
              </div>
            ) : (
              <SelectedAuthorsTable removeAuthor={removeAuthorFromTable} />
            )}
          </div>

          <hr className="mb-5"></hr>

          <div className="lg:grid lg:grid-cols-9 gap-2  lg:mb-6">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center gap-2">
                <label className="font-semibold text-sm text-gray-600 ">
                  DDC
                </label>
                <small className="text-gray-600 p-1 rounded bg-gray-200">
                  Required
                </small>
              </div>
              <div>
                <small className="text-gray-500 hidden lg:block">
                  The book classification based on Dewey Decimal Classification.
                </small>
              </div>
            </div>

            <div className="flex h-14 items-center  col-span-7">
              <Input
                wrapperclass="flex flex-col "
                error={errors?.ddc}
                value={form.ddc}
                onChange={handleFormInput}
                placeholder="DDC"
                name="ddc"
              />
              <SecondaryButton type="button" className="self-start ml-2">
                Browse
              </SecondaryButton>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-6">
            <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
              <div className="h-7 flex items-center">
                <label className="font-semibold text-sm text-gray-600 ">
                  Author number
                </label>
                <small className="text-gray-600 p-1 rounded bg-gray-200">
                  Required
                </small>
              </div>
              <div>
                <small className="text-gray-500 hidden lg:block">
                  The author number based on C.A. Cutter's Three-Figure Author
                  Table.
                </small>
              </div>
            </div>

            <div className="flex h-14 items-center col-span-7">
              <Input
                wrapperclass="flex flex-col "
                error={errors?.authorNumber}
                value={form.authorNumber}
                onChange={handleFormInput}
                placeholder="Author number"
                name="authorNumber"
              />
              <SecondaryButton
                type="button"
                className="self-start ml-2"
                onClick={() => {
                  openCutterSelection();
                }}
              >
                Browse
              </SecondaryButton>
            </div>
          </div>

          <AuthorSelectionModal
            closeModal={closeAuthorSelection}
            isOpen={isAuthorSelectionOpen}
            selectAuthor={selectAuthorFromTable}
            removeAuthor={removeAuthorFromTable}
            // selectedAuthors={form.authors?.filter((a) => a.id) ?? []}
          />

          <CutterSelectionModal
            selectedAuthors={form.authors}
            closeModal={closeCutterSelection}
            isOpen={isCutterSelectionOpen}
          />
        </div>

        <div className="w-full lg:w-11/12 mt-10 drop-shadow-md lg:rounded-md mx-auto mb-10 pb-5">
          <div>
            <PrimaryButton className="ml-2 lg:ml-0" type="submit">
              Add to Collection
            </PrimaryButton>
          </div>
        </div>
      </form>
    </BookAddProvider>
  );
};

export default BookAddForm;
