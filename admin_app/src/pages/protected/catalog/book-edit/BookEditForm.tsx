import { Input } from "@components/ui/form/Input";
import {
  PrimaryButton,
  PrimaryOutlineButton,
  SecondaryButton,
} from "@components/ui/button/Button";
import { useSwitch } from "@hooks/useToggle";
import { BaseSyntheticEvent, useEffect } from "react";

import { Section, Publisher, Source, Book } from "@definitions/types";

import { useMutation, useQuery } from "@tanstack/react-query";
import { SingleValue } from "react-select";
import CustomSelect from "@components/ui/form/CustomSelect";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import AuthorSelectionModal from "./author-selection/AuthorSelectionModal";
import SelectedAuthorsTable from "./author-selection/SelectedAuthorsTable";
import AuthorNumberSelectionModal from "./author-number-selection/AuthorNumberSelectionModal";
import { useBookEditFormContext } from "./BookEditFormContext";
import DDCSelectionModal from "./DDCSelectionModal";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import { Editor } from "@tinymce/tinymce-react";
import { FieldRow } from "@components/ui/form/FieldRow";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { buildS3Url } from "@definitions/configs/s3";
import { useNavigate, useParams } from "react-router-dom";
import { HttpStatusCode } from "axios";
import { useRequest } from "@hooks/useRequest";
import { useMsal } from "@azure/msal-react";
import { apiScope } from "@definitions/configs/msal/scopes";
import AddPublisherModal from "./AddPublisherModal";
import AddAuthorModal from "./AddAuthorModal";

const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".png", ".jpg", ".jpeg", ".webp"],
    maxNumberOfFiles: 3,
  },
}).use(XHRUpload, {
  fieldName: "covers",
  bundle: true,
  method: "PUT",
  endpoint: `${BASE_URL_V1}/books/covers`,
});

const BookEditForm = () => {
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
    validate,
    removeFieldError,
    setFieldValue,
    registerFormGroup,
  } = useBookEditFormContext();
  const { instance: msalInstance } = useMsal();
  const { Get, Put, Delete } = useRequest();
  const fetchPublishers = async () => {
    try {
      const { data: response } = await Get("/publishers/");
      return response.data?.publishers ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const fetchSourceofFunds = async () => {
    try {
      const { data: response } = await Get("/source-of-funds/");
      return response.data?.sources ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const fetchSections = async () => {
    try {
      const { data: response } = await Get("/sections/");
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
  const handleSectionSelect = (option: SingleValue<Section>) => {
    setFieldValue("section", option);
    removeFieldError("section");
  };
  const handleSourceSelect = (option: SingleValue<Source>) => {
    setFieldValue("fundSource", option);
    removeFieldError("fundSource");
  };
  const handlePublisherSelect = (option: SingleValue<Publisher>) => {
    setFieldValue("publisher", option);
    removeFieldError("publisher");
  };
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      const parsedForm = await validate();
      if (!parsedForm) return;
      mutation.mutate(parsedForm);
    } catch (err) {
      console.log(err);
    }
  };

  const mutation = useMutation({
    mutationFn: (parsedForm: Book) =>
      Put(`books/${parsedForm.id}`, {
        ...parsedForm,
        authorNumber: parsedForm.authorNumber,
      }),
    onSuccess: async () => {
      toast.success("Book has been updated.");

      const tokens = await msalInstance.acquireTokenSilent({
        scopes: [apiScope("Book.Cover.Edit")],
      });
      uppy.getPlugin("XHRUpload")?.setOptions({
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      const covers = uppy.getFiles();
      if (covers.length === 0) {
        console.log(covers);
        deleteBookCovers();
      }
      uppy.setMeta({ bookId: form.id });
      await uppy.upload();
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      window.scrollTo({ behavior: "smooth", top: 0 });
    },
  });

  const deleteBookCovers = async () => {
    try {
      await Delete(`/books/${form.id}/covers`, {}, [
        apiScope("Book.Cover.Edit"),
      ]);
    } catch (error) {
      console.log(error);
    }
  };
  const handleDescriptionInput = (content: string, editor: any) => {
    setFieldValue("description", content);
  };

  const navigate = useNavigate();
  const { id: bookId } = useParams();
  const fetchBook = async () => {
    const { data: response } = await Get(`/books/${bookId}`);
    return response?.data?.book ?? {};
  };
  useQuery<Book>({
    queryFn: fetchBook,
    queryKey: ["book"],
    staleTime: Infinity,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
    onSuccess: async (data) => {
      setForm({ ...data });
      for (const cover of data.covers) {
        try {
          const response = await fetch(buildS3Url(cover));
          if (response.status === HttpStatusCode.Ok) {
            const blob = await response.blob();
            uppy.addFile({
              name: cover,
              data: blob,
              size: blob.size,
            });
          }
        } catch {}
      }
    },
    onError: () => {
      {
        navigate("/void");
      }
    },
  });
  useEffect(() => {
    return () => {
      uppy.cancelAll();
    };
  }, []);
  const numberOfSelectedAuthors =
    form.authors.people.length +
    form.authors.organizations.length +
    form.authors.publishers.length;
  return (
    <>
      <form onSubmit={submit}>
        <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10">
          <h1 className="text-2xl">General Information</h1>
          <hr className="mb-5"></hr>
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
          <FieldRow
            isRequired
            label="Source of Fund"
            fieldDetails="This refers on how the book is acquired."
            ref={registerFormGroup("fundSource.value")}
          >
            <CustomSelect
              className="w-full"
              name="fundSource"
              wrapperclass="flex flex-col"
              onChange={handleSourceSelect}
              value={form.fundSource}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option?.id?.toString() ?? ""}
              error={errors?.fundSource?.id}
              options={sourceOfFunds}
            />
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
              value={form.description}
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
              hideCancelButton={true}
              locale={{
                strings: {
                  browseFiles: " browse",
                  dropPasteFiles: "Drop a book image cover, click to %{browse}",
                },
              }}
              hideProgressAfterFinish={true}
              hideRetryButton={true}
            ></Dashboard>
          </FieldRow>
        </div>
        <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto">
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
            {numberOfSelectedAuthors === 0 ? (
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

        <div className="w-full lg:w-11/12 mt-10 -md lg:rounded-md mx-auto mb-10 pb-5">
          <div>
            <PrimaryButton className="ml-2 lg:ml-0" type="submit">
              Update Book
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

export default BookEditForm;
