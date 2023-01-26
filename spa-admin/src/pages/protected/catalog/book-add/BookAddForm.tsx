import { Input, PrimaryButton, SecondaryButton } from "@components/forms/Forms";
import { useSwitch } from "@hooks/useToggle";
import { BaseSyntheticEvent, useRef } from "react";

import { Author, Section, Publisher, Source, Book } from "@definitions/types";

import axiosClient from "@definitions/configs/axios";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SingleValue } from "react-select";
import CustomSelect from "@components/forms/CustomSelect";
import CustomDatePicker from "@components/forms/CustomDatePicker";
import AuthorSelectionModal from "./author-selection/AuthorSelectionModal";
import SelectedAuthorsTable from "./author-selection/SelectedAuthorsTable";
import AuthorNumberSelectionModal from "./author-number-selection/AuthorNumberSelectionModal";
import { useBookAddFormContext, NewBookForm } from "./BookAddFormContext";
import DDCSelectionModal from "./DDCSelectionModal";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import { Editor } from "@tinymce/tinymce-react";

const BookAddForm = () => {
  const {
    isOpen: isAuthorSelectionOpen,
    close: closeAuthorSelection,
    open: openAuthorSelection,
  } = useSwitch();
  const {
    isOpen: isAuthorNumberSelectionOpen,
    close: closeAuthorNumberSelection,
    open: openAuthorNumberSelection,
  } = useSwitch();
  const {
    isOpen: isDDCSelectionOpen,
    close: closeDDCSelection,
    open: openDDCSelection,
  } = useSwitch();
  const {
    form,
    handleFormInput,
    errors,
    setForm,
    resetForm,
    validate,
    removeFieldError,
    setFieldValue,
  } = useBookAddFormContext();

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
    option: SingleValue<{ label: string; value: number }>
  ) => {
    setFieldValue("section", option);
    removeFieldError("section.value");
  };
  const handleSourceSelect = (
    option: SingleValue<{ label: string; value: number }>
  ) => {
    setFieldValue("fundSource", option);
    removeFieldError("fundSource.value");
  };
  const handlePublisherSelect = (
    option: SingleValue<{ label: string; value: number }>
  ) => {
    setFieldValue("publisher", option);
    removeFieldError("publisher.value");
  };
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      const parsedForm = await validate();
      if (!parsedForm) return;
      console.log(parsedForm);
      mutation.mutate(parsedForm);
    } catch {}
  };

  const mutation = useMutation({
    mutationFn: (parsedForm: NewBookForm) =>
      axiosClient.post("/books/", {
        ...parsedForm,
        authorNumber: parsedForm.authorNumber,
      }),
    onSuccess: () => {
      toast.success("Book has been added");
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      resetForm();
      window.scrollTo({ behavior: "smooth", top: 0 });
    },
  });
  const handleDescriptionInput = (content: string, editor: any) => {
    setFieldValue("description", content);
  };

  return (
    <form onSubmit={submit}>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto mb-10">
        <h2 className="text-2xl">General Information</h2>
        <hr className="mb-5"></hr>
        <FieldRow
          fieldDetails="The title can be found in the cover of the book."
          isRequired
          label="Title"
          formGroup="title"
        >
          <Input
            wrapperclass="flex flex-col "
            error={errors?.title}
            value={form.title}
            onChange={handleFormInput}
            placeholder="Book title"
            name="title"
          />
        </FieldRow>
        <FieldRow
          fieldDetails="ISBN can be 13 or 9 characters."
          isRequired={true}
          label="ISBN"
          formGroup="isbn"
        >
          <Input
            wrapperclass="flex flex-col "
            error={errors?.isbn}
            value={form.isbn}
            onChange={handleFormInput}
            placeholder="Book ISBN"
            name="isbn"
          />
        </FieldRow>
        <FieldRow label="Copies" isRequired formGroup="copies">
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
        </FieldRow>
        <FieldRow label="Pages" formGroup="pages">
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
        </FieldRow>
        <FieldRow
          label="Section"
          isRequired
          fieldDetails="This refers to the book section or collection the book will be
                added."
          formGroup="section.value"
        >
          <CustomSelect
            wrapperclass="w-full flex flex-col"
            onChange={handleSectionSelect}
            value={form.section}
            className="w-full"
            error={errors?.section?.value}
            options={sections?.map((section) => {
              return {
                value: section.id ?? 0,
                label: section.name,
              };
            })}
          />
        </FieldRow>
        <FieldRow label="Publisher" formGroup="publisher.value" isRequired>
          <CustomSelect
            name="publisher"
            wrapperclass="flex flex-col"
            className="w-full"
            onChange={handlePublisherSelect}
            value={form.publisher}
            error={errors?.publisher?.value}
            options={publishers?.map((publisher) => {
              return { value: publisher.id ?? 0, label: publisher.name };
            })}
          />
        </FieldRow>
        <FieldRow
          isRequired
          label="Source of Fund"
          fieldDetails="This refers on how the book is acquired."
          formGroup="fundSource.value"
        >
          <CustomSelect
            className="w-full"
            name="fundSource"
            wrapperclass="flex flex-col"
            onChange={handleSourceSelect}
            value={form.fundSource}
            error={errors?.fundSource?.value}
            options={sourceOfFunds?.map((source) => {
              return { value: source.id ?? 0, label: source.name };
            })}
          />
        </FieldRow>
        <FieldRow label="Cost Price" formGroup="costPrice">
          <Input
            error={errors?.costPrice}
            type="number"
            value={form.costPrice}
            onChange={handleFormInput}
            placeholder="Book price"
            name="costPrice"
          />
        </FieldRow>
        <FieldRow label="Edition" formGroup="edition">
          <Input
            error={errors?.edition}
            type="number"
            value={form.edition}
            onChange={handleFormInput}
            placeholder="Book copies"
            name="edition"
          />
        </FieldRow>
        <FieldRow isRequired label="Year Published" formGroup="yearPublished">
          <CustomDatePicker
            wrapperclass="flex flex-col"
            selected={new Date(form.yearPublished, 0, 24)}
            onChange={(date) => {
              if (!date?.getFullYear()) return;
              setFieldValue("yearPublished", date.getFullYear());
            }}
            showYearPicker
            dateFormat="yyyy"
            yearItemNumber={9}
          />
        </FieldRow>
        <FieldRow isRequired label="Date Received" formGroup="receivedAt">
          <CustomDatePicker
            onChange={(date) => {
              if (!date) return;
              setFieldValue("receivedAt", date.toISOString());
            }}
            selected={new Date(form.receivedAt)}
          />
        </FieldRow>
        <FieldRow
          label="Description"
          formGroup="description"
          fieldDetails="Brief Description of the book"
        >
          <Editor
            apiKey="dj5q6q3r4r8f9a9nt139kk6ba97ntgvdn3iiobqmeef4k4ei"
            onEditorChange={handleDescriptionInput}
          />
        </FieldRow>
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

        <FieldRow
          fieldDetails="The book classification based on Dewey Decimal Classification"
          isRequired
          label="DDC"
          formGroup="ddc"
        >
          <div className="w-full h-full flex ">
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
        </FieldRow>
        <FieldRow
          label="Author number"
          isRequired
          fieldDetails="The author number based on C.A. Cutter's Three-Figure Author
                Table"
          formGroup="authorNumber"
        >
          <div className="w-full h-full flex">
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
                openAuthorNumberSelection();
              }}
            >
              Browse
            </SecondaryButton>
          </div>
        </FieldRow>
        <AuthorSelectionModal
          closeModal={closeAuthorSelection}
          isOpen={isAuthorSelectionOpen}
          selectAuthor={selectAuthorFromTable}
          removeAuthor={removeAuthorFromTable}
        />
        <DDCSelectionModal
          closeModal={closeDDCSelection}
          isOpen={isDDCSelectionOpen}
        />
        <AuthorNumberSelectionModal
          closeModal={closeAuthorNumberSelection}
          isOpen={isAuthorNumberSelectionOpen}
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

type FieldRowProps = {
  isRequired?: boolean;
  label?: string;
  children?: React.ReactNode;
  fieldDetails?: string;
  formGroup?: string;
};
const FieldRow = ({
  isRequired = false,
  fieldDetails,
  label = "",
  children,
  formGroup = "",
}: FieldRowProps) => {
  return (
    <div
      className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8"
      form-group={formGroup}
    >
      <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
        <div className="h-7 flex items-center gap-2">
          <label className="font-semibold text-sm text-gray-600 ">
            {label}
          </label>

          {isRequired && (
            <small className="text-gray-600 p-1 rounded bg-gray-200">
              Required
            </small>
          )}
        </div>
        <div>
          {fieldDetails && (
            <small className="text-gray-500 hidden lg:block">
              {fieldDetails}
            </small>
          )}
        </div>
      </div>

      <div className="col-span-7">{children}</div>
    </div>
  );
};

export default BookAddForm;