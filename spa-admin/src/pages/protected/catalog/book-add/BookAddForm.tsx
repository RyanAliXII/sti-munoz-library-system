import { Input, PrimaryButton, SecondaryButton } from "@components/forms/Forms";
import { useSwitch } from "@hooks/useToggle";
import { BaseSyntheticEvent, useEffect } from "react";

import { Author, Section, Publisher, Source, Book } from "@definitions/types";

import axiosClient from "@definitions/configs/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SingleValue } from "react-select";
import CustomSelect from "@components/forms/CustomSelect";
import CustomDatePicker from "@components/forms/CustomDatePicker";
import { Editor } from "@tinymce/tinymce-react";

import AuthorSelectionModal from "./AuthorSelectionModal";
import SelectedAuthorsTable from "./SelectedAuthorsTable";
import CutterSelectionModal from "./CutterSelectionModal";
import { useBookAddContext } from "./BookAddContext";
import DDCSelectionModal from "./DDCSelectionModal";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";

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
    isOpen: isDDCSelectionOpen,
    close: closeDDCSelection,
    open: openDDCSelection,
  } = useSwitch();
  const { formClient } = useBookAddContext();
  const {
    validate,
    setForm,
    clearErrorWithKey,
    errors,
    form,
    handleFormInput,
  } = formClient;

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
  const fetchSections = async () => {
    try {
      const { data: response } = await axiosClient.get("/sections/");
      return response.data?.sections ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const { data: publishers } = useQuery<Publisher[]>({
    queryFn: fetchPublishers,
    queryKey: ["publishers"],
  });
  const { data: sourceOfFunds } = useQuery<Source[]>({
    queryFn: fetchSourceofFunds,
    queryKey: ["sources"],
  });
  const { data: sections } = useQuery<Section[]>({
    queryFn: fetchSections,
    queryKey: ["sections"],
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
  const handleSectionSelect = (
    option: SingleValue<{ label: string; value: number | undefined }>
  ) => {
    if (!option?.value) return;

    setForm((prevForm) => ({ ...prevForm, sectionId: option.value as number }));
    formClient.clearErrorWithKey("sectionId");
  };
  const handleSourceSelect = (
    option: SingleValue<{ label: string; value: number | undefined }>
  ) => {
    if (!option?.value) return;

    setForm((prevForm) => ({
      ...prevForm,
      fundSourceId: option.value as number,
    }));
    clearErrorWithKey("fundSourceId");
  };
  const handlePublisherSelect = (
    option: SingleValue<{ label: string; value: number | undefined }>
  ) => {
    if (!option?.value) return;

    setForm((prevForm) => ({
      ...prevForm,
      publisherId: option?.value as number,
    }));
    clearErrorWithKey("publisherId");
  };
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      const parsedForm = await validate();
      if (!parsedForm) return;
      mutation.mutate(parsedForm);
    } catch {}
  };

  const mutation = useMutation({
    mutationFn: (parsedForm: Omit<Book, "id">) =>
      axiosClient.post("/books/", {
        ...parsedForm,
        authorNumber: parsedForm.authorNumber.value,
      }),
    onSuccess: () => {
      toast.success("Book has been added");
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
  });

  return (
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
        <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8">
          <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
            <div className="h-7 flex items-center gap-2">
              <label className="font-semibold text-sm text-gray-600 ">
                ISBN
              </label>
              <small className="text-gray-600 p-1 rounded bg-gray-200">
                Required
              </small>
            </div>
            <div>
              <small className="text-gray-500 hidden lg:block">
                The ISBN can be found usually on the back of the book.
              </small>
            </div>
          </div>

          <div className="flex h-14 items-center  col-span-7">
            <Input
              wrapperclass="flex flex-col "
              error={errors?.isbn}
              value={form.isbn}
              onChange={handleFormInput}
              placeholder="Book ISBN"
              name="isbn"
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
              min={1}
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
            <div></div>
          </div>

          <div className="flex h-14 items-center col-span-7">
            <Input
              wrapperclass="flex flex-col"
              error={errors?.pages}
              type="number"
              value={form.pages}
              min={1}
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
                Section
              </label>
              <small className="text-gray-600 p-1 rounded bg-gray-200">
                Required
              </small>
            </div>
            <div>
              <small className="text-gray-500 hidden lg:block pr-5">
                This refers to the book section or collection the book will be
                added.
              </small>
            </div>
          </div>

          <div className="flex h-14 items-center  col-span-7">
            <CustomSelect
              name="sectionId"
              wrapperclass="w-full flex flex-col"
              onChange={handleSectionSelect}
              className="w-full"
              error={errors?.sectionId}
              options={sections?.map((section) => {
                return {
                  value: section.id,
                  label: section.name,
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
              name="publisherId"
              wrapperclass="flex flex-col"
              className="w-full"
              onChange={handlePublisherSelect}
              error={errors?.publisherId}
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
              name="fundSourceId"
              wrapperclass="flex flex-col"
              onChange={handleSourceSelect}
              error={errors?.fundSourceId}
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
              placeholder="Book price"
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
              selected={new Date(form.yearPublished, 0, 24)}
              onChange={(date) => {
                if (!date?.getFullYear()) return;
                setForm((prevForm) => ({
                  ...prevForm,
                  yearPublished: date.getFullYear(),
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
                  receivedAt: date?.toISOString(),
                }));
              }}
              selected={new Date(form.receivedAt)}
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
              type="number"
              wrapperclass="flex flex-col "
              error={errors?.ddc}
              value={form.ddc}
              onChange={handleFormInput}
              placeholder="DDC"
              name="ddc"
            />
            <SecondaryButton
              type="button"
              className="self-start ml-2"
              onClick={openDDCSelection}
            >
              Browse
            </SecondaryButton>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-9 gap-2 lg:mb-6">
          <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
            <div className="h-7 flex items-center gap-2">
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
              error={errors?.authorNumber?.value}
              value={form.authorNumber.value}
              onChange={handleFormInput}
              placeholder="Author number"
              name="authorNumber.value"
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
        <DDCSelectionModal
          closeModal={closeDDCSelection}
          isOpen={isDDCSelectionOpen}
        />
        <CutterSelectionModal
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
  );
};

export default BookAddForm;
