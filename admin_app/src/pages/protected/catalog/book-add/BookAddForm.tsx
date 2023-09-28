import { Input } from "@components/ui/form/Input";

import {
  PrimaryButton,
  PrimaryOutlineButton,
} from "@components/ui/button/Button";

import { useSwitch } from "@hooks/useToggle";
import { BaseSyntheticEvent, useEffect, useState } from "react";

import { Section, Publisher, Source, Book } from "@definitions/types";

import { useMutation, useQuery } from "@tanstack/react-query";
import { SingleValue } from "react-select";
import CustomSelect from "@components/ui/form/CustomSelect";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";

import { useBookAddFormContext } from "./BookAddFormContext";
import DDCSelectionModal from "./DDCSelectionModal";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import { Editor } from "@tinymce/tinymce-react";
import { ContainerNoBackground } from "@components/ui/container/Container";
import { FieldRow } from "@components/ui/form/FieldRow";
import AuthorSelectionModal from "./author-selection/AuthorSelectionModal";
import SelectedAuthorsTable from "./author-selection/SelectedAuthorsTable";
import AuthorNumberSelectionModal from "./author-number-selection/AuthorNumberSelectionModal";

import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { useRequest } from "@hooks/useRequest";

import { useMsal } from "@azure/msal-react";
import { apiScope } from "@definitions/configs/msal/scopes";
import AddPublisherModal from "./AddPublisherModal";
import AddAuthorModal from "./AddAuthorModal";

const TW0_SECONDS = 2000;
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".png", ".jpg", ".jpeg", ".webp"],
    maxNumberOfFiles: 3,
  },
  infoTimeout: TW0_SECONDS,
}).use(XHRUpload, {
  fieldName: "covers",
  bundle: true,
  headers: {},
  endpoint: `${BASE_URL_V1}/books/covers`,
});
const BookAddForm = () => {
  const { instance: msalInstance } = useMsal();
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
    isOpen: isAddPublisherModalOpen,
    close: closeAddPublisherModal,
    open: openAddPublisherModal,
  } = useSwitch();
  const {
    isOpen: isAddAuthorModalOpen,
    close: closeAddAuthorModal,
    open: openAddAuthorModal,
  } = useSwitch();
  const {
    form,
    handleFormInput,
    errors,
    resetForm,
    validate,
    removeFieldError,
    setFieldValue,
    registerFormGroup,
  } = useBookAddFormContext();
  const { Get, Post } = useRequest();
  const fetchPublishers = async () => {
    try {
      const { data: response } = await Get("/publishers/", {}, [
        apiScope("Publisher.Read"),
      ]);
      return response.data?.publishers ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const fetchSourceofFunds = async () => {
    try {
      const { data: response } = await Get("/source-of-funds/", {}, [
        apiScope("SOF.Read"),
      ]);
      return response.data?.sources ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const fetchSections = async () => {
    try {
      const { data: response } = await Get("/sections/", {}, [
        apiScope("Section.Read"),
      ]);
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

  const handleSectionSelect = (option: SingleValue<Section>) => {
    setFieldValue("section", option);
    removeFieldError("section");
  };

  const handlePublisherSelect = (option: SingleValue<Publisher>) => {
    setFieldValue("publisher", option);
    removeFieldError("publisher");
  };
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      const formData = await validate();
      if (!formData) return;
      newBook.mutate(formData);
    } catch {}
  };

  const newBook = useMutation({
    mutationFn: (parsedForm: Book) =>
      Post(
        "/books/",
        {
          ...parsedForm,
          authorNumber: parsedForm.authorNumber,
        },
        {},
        [apiScope("Book.Add")]
      ),
    onSuccess: async ({ data: response }) => {
      toast.success("Book has been added");
      if (!response?.data?.book?.id) {
        uppy.cancelAll();
        return;
      }
      const tokens = await msalInstance.acquireTokenSilent({
        scopes: [apiScope("Book.Cover.Add")],
      });
      uppy.getPlugin("XHRUpload")?.setOptions({
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      uppy.setMeta({
        bookId: response.data.book.id,
      });
      uppy.upload().finally(() => {
        uppy.cancelAll();
      });
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

  useEffect(() => {
    return () => {
      uppy.cancelAll();
    };
  }, []);
  return (
    <>
      <form onSubmit={submit}>
        <ContainerNoBackground>
          <div className="mb-5">
            <h1 className="text-2xl">General Information</h1>
            <hr className="mb-5"></hr>
          </div>
          <FieldRow
            fieldDetails="The title can be found in the cover of the book."
            isRequired
            label="Title"
            ref={registerFormGroup("title")}
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
            ref={registerFormGroup("isbn")}
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
          <FieldRow label="Copies" isRequired ref={registerFormGroup("copies")}>
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
          <FieldRow label="Pages" ref={registerFormGroup("pages")}>
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
            ref={registerFormGroup("section.value")}
          >
            <CustomSelect
              wrapperclass="w-full flex flex-col"
              onChange={handleSectionSelect}
              value={form.section}
              className="w-full"
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option?.id?.toString() ?? ""}
              error={errors?.section?.id}
              options={sections}
            />
          </FieldRow>
          <FieldRow
            label="Publisher"
            ref={registerFormGroup("publisher.value")}
            isRequired
          >
            <div className="flex">
              <CustomSelect
                name="publisher"
                wrapperclass="flex-1"
                onChange={handlePublisherSelect}
                value={form.publisher}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option?.id?.toString() ?? ""}
                error={errors?.publisher?.id}
                options={publishers}
              />
              <PrimaryOutlineButton
                className="text-sm ml-2"
                type="button"
                onClick={() => {
                  openAddPublisherModal();
                }}
                style={{ maxHeight: "38px" }}
              >
                Add Publisher
              </PrimaryOutlineButton>
            </div>
          </FieldRow>

          <FieldRow label="Cost Price" ref={registerFormGroup("costPrice")}>
            <Input
              error={errors?.costPrice}
              type="number"
              value={form.costPrice}
              onChange={handleFormInput}
              placeholder="Book price"
              name="costPrice"
            />
          </FieldRow>
          <FieldRow label="Edition" ref={registerFormGroup("edition")}>
            <Input
              error={errors?.edition}
              type="number"
              value={form.edition}
              onChange={handleFormInput}
              placeholder="Book copies"
              name="edition"
            />
          </FieldRow>
          <FieldRow
            isRequired
            label="Year Published"
            ref={registerFormGroup("yearPublished")}
          >
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
          <FieldRow
            isRequired
            label="Date Received"
            ref={registerFormGroup("receivedAt")}
          >
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
            fieldDetails="Brief Description of the book"
          >
            <Editor
              apiKey="dj5q6q3r4r8f9a9nt139kk6ba97ntgvdn3iiobqmeef4k4ei"
              onEditorChange={handleDescriptionInput}
            />
          </FieldRow>
          <FieldRow
            label="Book Cover"
            fieldDetails="Add image cover of the book"
          >
            <Dashboard
              uppy={uppy}
              width={"100%"}
              height={"450px"}
              hideUploadButton={true}
              locale={{
                strings: {
                  browseFiles: " browse",
                  dropPasteFiles: "Drop a book image cover, click to %{browse}",
                },
              }}
            ></Dashboard>
          </FieldRow>
        </ContainerNoBackground>
        <ContainerNoBackground>
          <h1 className="mt-10 text-2xl">Authors and Classification</h1>
          <hr className="mb-5"></hr>
          <div className="flex gap-3 mb-5 ">
            <a
              className=" text-blue-500 text-sm underline underline-offset-1 cursor-pointer font-semibold"
              onClick={openAuthorSelection}
            >
              Select Authors
            </a>
            <a
              className=" text-yellow-500 text-sm cursor-pointer font-semibold"
              onClick={openAddAuthorModal}
            >
              New Author
            </a>
          </div>
          <div
            className="mb-10 overflow-y-auto scroll-smooth"
            style={{ maxHeight: "300px" }}
          >
            {form.authors.length === 0 ? (
              <div className="flex items-center h-10 justify-center">
                <small className="text-gray-400">No authors selected.</small>
              </div>
            ) : (
              <SelectedAuthorsTable />
            )}
          </div>

          <hr className="mb-5"></hr>

          <FieldRow
            fieldDetails="The book classification based on Dewey Decimal Classification"
            isRequired
            label="DDC"
            ref={registerFormGroup("ddc")}
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
              <PrimaryOutlineButton
                type="button"
                className="self-start ml-2 text-sm"
                onClick={openDDCSelection}
              >
                Browse
              </PrimaryOutlineButton>
            </div>
          </FieldRow>
          <FieldRow
            label="Author number"
            isRequired
            fieldDetails="The author number based on C.A. Cutter's Three-Figure Author
                Table"
            ref={registerFormGroup("authorNumber")}
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
              <PrimaryOutlineButton
                type="button"
                className="self-start ml-2 text-sm"
                onClick={() => {
                  openAuthorNumberSelection();
                }}
              >
                Browse
              </PrimaryOutlineButton>
            </div>
          </FieldRow>
          <AuthorSelectionModal
            closeModal={closeAuthorSelection}
            isOpen={isAuthorSelectionOpen}
          />
          <DDCSelectionModal
            closeModal={closeDDCSelection}
            isOpen={isDDCSelectionOpen}
          />
          <AuthorNumberSelectionModal
            closeModal={closeAuthorNumberSelection}
            isOpen={isAuthorNumberSelectionOpen}
          />
        </ContainerNoBackground>

        <div className="w-full lg:w-11/12 mt-10 -md lg:rounded-md mx-auto mb-10 pb-5">
          <div>
            <PrimaryButton className="ml-2 lg:ml-0" type="submit">
              Add to Collection
            </PrimaryButton>
          </div>
        </div>
      </form>
      <AddPublisherModal
        closeModal={closeAddPublisherModal}
        isOpen={isAddPublisherModalOpen}
      />
      <AddAuthorModal
        closeModal={closeAddAuthorModal}
        isOpen={isAddAuthorModalOpen}
      />
    </>
  );
};

export default BookAddForm;
