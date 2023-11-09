import { CustomInput } from "@components/ui/form/Input";
import { useSwitch } from "@hooks/useToggle";
import { BaseSyntheticEvent, useEffect, useState } from "react";

import { Book, Publisher, Section } from "@definitions/types";

import { useMsal } from "@azure/msal-react";
import Container from "@components/ui/container/Container";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { FieldRow } from "@components/ui/form/FieldRow";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { apiScope } from "@definitions/configs/msal/scopes";
import { buildS3Url } from "@definitions/configs/s3";
import { ErrorMsg } from "@definitions/var";
import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Editor } from "@tinymce/tinymce-react";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { HttpStatusCode } from "axios";
import { format, isValid } from "date-fns";
import { Button } from "flowbite-react";
import { useNavigate, useParams } from "react-router-dom";
import { MultiValue, SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import AddAuthorModal from "./AddAuthorModal";
import AddPublisherModal from "./AddPublisherModal";
import { useBookEditFormContext } from "./BookEditFormContext";
import DDCSelectionModal from "./DDCSelectionModal";
import AuthorNumberSelectionModal from "./author-number-selection/AuthorNumberSelectionModal";
import AuthorSelectionModal from "./author-selection/AuthorSelectionModal";
import SelectedAuthorsTable from "./author-selection/SelectedAuthorsTable";
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
      const { data: response } = await Get("/publishers/", {
        params: {
          keyword: keyword,
        },
      });
      return response.data?.publishers ?? [];
    } catch (error) {
      console.log(error);
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
  const [keyword, setKeyword] = useState("");
  const debounce = useDebounce();
  const { data: publishers } = useQuery<Publisher[]>({
    queryFn: fetchPublishers,
    queryKey: ["publishers", keyword],
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
        scopes: [apiScope("LibraryServer.Access")],
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
      await Delete(`/books/${form.id}/covers`, {});
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
      let receivedAt = new Date(data.receivedAt);
      delete data["createdAt"];
      if (!isValid(receivedAt)) {
        receivedAt = new Date();
      }
      let strReceivedAt = format(receivedAt, "yyyy-MM-dd");
      setForm({ ...data, receivedAt: strReceivedAt });

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

  return (
    <>
      <form onSubmit={submit}>
        <Container>
          <div className="mb-5">
            <h1 className="text-2xl dark:text-white">General Information</h1>
            <hr className="mb-5 h-px my-3 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          </div>
          <FieldRow
            fieldDetails="The title can be found in the cover of the book."
            isRequired
            label="Title"
            ref={registerFormGroup("title")}
          >
            <CustomInput
              wrapperclass="flex flex-col "
              error={errors?.title}
              value={form.title}
              onChange={handleFormInput}
              placeholder="Book title"
              name="title"
            />
          </FieldRow>
          <FieldRow
            fieldDetails="Main topic or theme that a book explores, addressing specific ideas, events, or concepts within a broader field of knowledge or narrative"
            label="Subject"
            ref={registerFormGroup("subject")}
          >
            <CustomInput
              wrapperclass="flex flex-col "
              error={errors?.subject}
              value={form.subject}
              onChange={handleFormInput}
              placeholder="Book subject"
              name="subject"
            />
          </FieldRow>
          <FieldRow
            fieldDetails="ISBN can be 13 or 9 characters."
            isRequired={true}
            label="ISBN"
            ref={registerFormGroup("isbn")}
          >
            <CustomInput
              wrapperclass="flex flex-col "
              error={errors?.isbn}
              value={form.isbn}
              onChange={handleFormInput}
              placeholder="Book ISBN"
              name="isbn"
            />
          </FieldRow>
          <FieldRow label="Pages" ref={registerFormGroup("pages")}>
            <CustomInput
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
                onInputChange={(text: string) => {
                  if (text.length === 0) return;
                  debounce(
                    () => {
                      setKeyword(text);
                    },
                    "",
                    500
                  );
                }}
                onChange={handlePublisherSelect}
                value={form.publisher}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option?.id?.toString() ?? ""}
                error={errors?.publisher?.id}
                options={publishers}
              />
              <Button
                type="button"
                outline
                gradientDuoTone="primaryToPrimary"
                className="border border-primary-500 text-primary-500 dark:border-primary-500 dark:text-primary-400 self-start ml-2 text-sm"
                onClick={() => {
                  openAddPublisherModal();
                }}
                style={{ maxHeight: "38px" }}
              >
                Add Publisher
              </Button>
            </div>
          </FieldRow>

          <FieldRow label="Cost Price" ref={registerFormGroup("costPrice")}>
            <CustomInput
              error={errors?.costPrice}
              type="number"
              value={form.costPrice}
              onChange={handleFormInput}
              placeholder="Book price"
              name="costPrice"
            />
          </FieldRow>
          <FieldRow label="Edition" ref={registerFormGroup("edition")}>
            <CustomInput
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
                setFieldValue("receivedAt", format(date, "yyyy-MM-dd"));
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
              init={{
                statusbar: false,
              }}
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
        </Container>
        <Container>
          <div className="mb-5">
            <h1 className="text-2xl dark:text-white">
              Authors and Classification
            </h1>
            <hr className="mb-5 h-px my-3 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          </div>
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
            className="mb-10 overflow-y-auto scroll-smooth small-scroll"
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
              <CustomInput
                type="number"
                className="flex-1"
                error={errors?.ddc}
                value={form.ddc}
                onChange={handleFormInput}
                placeholder="DDC"
                name="ddc"
              />
              <Button
                type="button"
                outline
                gradientDuoTone="primaryToPrimary"
                className="border border-primary-500 text-primary-500 dark:border-primary-500 dark:text-primary-400 self-start ml-2 text-sm"
                onClick={openDDCSelection}
              >
                Browse
              </Button>
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
              <CustomInput
                className="flex-1"
                error={errors?.authorNumber}
                value={form.authorNumber}
                onChange={handleFormInput}
                placeholder="Author number"
                name="authorNumber"
              />
              <Button
                type="button"
                outline
                gradientDuoTone="primaryToPrimary"
                className="border border-primary-500 text-primary-500 dark:border-primary-500 dark:text-primary-400 self-start ml-2 text-sm"
                onClick={() => {
                  openAuthorNumberSelection();
                }}
              >
                Browse
              </Button>
            </div>
          </FieldRow>
          <FieldRow
            fieldDetails="Add texts related to this title to improve search results"
            label="Search Tags"
            ref={registerFormGroup("ddc")}
          >
            <CreatableSelect
              isMulti
              classNames={{
                control: () =>
                  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-0.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
                menu: () =>
                  "bg-gray-50 text-gray-500 dark:bg-gray-700 dark:text-white",
                multiValue: () => "dark:bg-gray-800 dark:text-white",
                multiValueLabel: () => "dark:text-white",
              }}
              value={
                form?.searchTags?.map((v) => ({ value: v, label: v })) ?? []
              }
              onChange={(
                newValue: MultiValue<{ value: string; label: string }>
              ) => {
                setFieldValue(
                  "searchTags",
                  newValue.map((v) => v.value)
                );
              }}
            />
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
          <div>
            <Button
              type="submit"
              color="primary"
              isProcessing={mutation.isLoading}
            >
              Save
            </Button>
          </div>
        </Container>
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
