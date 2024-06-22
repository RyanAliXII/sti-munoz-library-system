import { useMsal } from "@azure/msal-react";
import Container from "@components/ui/container/Container";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { FieldRow } from "@components/ui/form/FieldRow";
import { CustomInput } from "@components/ui/form/Input";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { apiScope } from "@definitions/configs/msal/scopes";
import { Book, Publisher, Section } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Editor } from "@tinymce/tinymce-react";
import Compressor from "@uppy/compressor";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { Button, Table } from "flowbite-react";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";
import { useBeforeUnload } from "react-router-dom";
import { MultiValue, SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import AddAuthorModal from "./AddAuthorModal";
import AddPublisherModal from "./AddPublisherModal";
import { useBookAddFormContext } from "./BookAddFormContext";
import DDCSelectionModal from "./DDCSelectionModal";
import AuthorNumberSelectionModal from "./author-number-selection/AuthorNumberSelectionModal";
import AuthorSelectionModal from "./author-selection/AuthorSelectionModal";
import SelectedAuthorsTable from "./author-selection/SelectedAuthorsTable";
const TW0_SECONDS = 2000;
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".png", ".jpg", ".jpeg", ".webp"],
    maxNumberOfFiles: 3,
  },
  infoTimeout: TW0_SECONDS,
})
  .use(Compressor)
  .use(XHRUpload, {
    fieldName: "covers",
    bundle: true,
    headers: {},
    endpoint: `${BASE_URL_V1}/books/covers`,
  });

const eBookUppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".pdf"],
    maxNumberOfFiles: 1,
  },
})
  .use(Compressor)
  .use(XHRUpload, {
    endpoint: "",
    method: "PUT",
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
    setForm,
    setErrors,
  } = useBookAddFormContext();
  const { Get, Post, Put } = useRequest();
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
    mutationFn: (parsedForm: Omit<Book, "copies">) =>
      Post(
        "/books/",
        {
          ...parsedForm,
          authorNumber: parsedForm.authorNumber,
        },
        {}
      ),
    onSuccess: async ({ data: response }) => {
      toast.success("Resource has been added");
      resetForm();
      if (!response?.data?.book?.id) {
        uppy.cancelAll();
        return;
      }
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: [apiScope("LibraryServer.Access")],
      });
      uppy.getPlugin("XHRUpload")?.setOptions({
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });
      const bookId = response.data.book.id;
      uppy.setMeta({
        bookId,
      });
      uppy.upload().finally(() => {
        uppy.cancelAll();
      });
      const hasFiles = eBookUppy.getFiles().length > 0;
      if (!hasFiles) return;
      const uploadRequestResponse = await Get("/books/ebooks/upload-requests");
      const { data } = uploadRequestResponse.data;
      const url = data?.url;
      const key = data?.key;
      if (!url || !key) return;
      eBookUppy.getPlugin("XHRUpload")?.setOptions({
        headers: {
          "Content-Type": "application/pdf",
        },
        endpoint: url,
      });

      try {
        await eBookUppy.upload();
        await Put(`/books/${bookId}/ebooks`, {
          key,
        });
      } catch (error) {
        toast.error("Unknown error occured while, uploading eBook");
        console.error(error);
      } finally {
        eBookUppy.cancelAll();
      }
    },
    onError: (error: AxiosError<any, any>) => {
      const { data } = error?.response?.data;
      if (data?.errors) {
        setErrors(data?.errors);
        return;
      }
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      window.scrollTo({ behavior: "smooth", top: 0 });
    },
  });
  const handleDescriptionInput = (content: string, editor: any) => {
    setFieldValue("description", content);
  };
  useBeforeUnload((event) => {
    event.preventDefault();
    return "Are you you want to navigate away to this page? All work you have done will be lost?";
  });
  useEffect(() => {
    return () => {
      uppy.cancelAll();
    };
  }, []);
  const addCopy = () => {
    setForm((prev) => ({
      ...prev,
      accessions: [
        ...prev.accessions,
        {
          copyNumber: prev.accessions.length + 1,
          number: 0,
          isAvailable: false,
          isMissing: false,
          isWeeded: false,
          remarks: "",
        },
      ],
    }));
  };
  const removeCopy = (copyNumber: number) => {
    setForm((prev) => {
      const filtered = prev.accessions.filter(
        (a) => a.copyNumber != copyNumber
      );
      const arranged = filtered.map((a, index) => {
        return { ...a, copyNumber: index + 1 };
      });
      return { ...prev, accessions: arranged };
    });
  };
  const handleAccessionInput = (index: number, value: number) => {
    removeFieldError(`accessions[${index}].number`);
    setForm((prev) => {
      const accessions = [...prev.accessions];
      accessions[index] = {
        ...accessions[index],
        number: value,
      };
      return { ...prev, accessions: accessions };
    });
  };
  console.log(errors);
  return (
    <>
      <form onSubmit={submit}>
        <Container className="px-4">
          <div className="mb-5">
            <h1 className="text-2xl dark:text-white">General Information</h1>
            <hr className="mb-5 h-px my-3 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          </div>
          <FieldRow
            fieldDetails="The title can be found in the cover of the reading material"
            isRequired
            label="Title"
            ref={registerFormGroup("title")}
          >
            <CustomInput
              name="title"
              error={errors?.title}
              onChange={handleFormInput}
              value={form.title}
              placeholder="Title"
            />
          </FieldRow>
          <FieldRow
            fieldDetails="Main topic or theme that a reading material explores, addressing specific ideas, events, or concepts within a broader field of knowledge or narrative"
            label="Subject"
            ref={registerFormGroup("subject")}
          >
            <CustomInput
              name="subject"
              error={errors?.subject}
              onChange={handleFormInput}
              value={form.subject}
              placeholder="Subject of the reading material"
            />
          </FieldRow>
          <FieldRow
            fieldDetails="ISBN can be 13 or 9 characters"
            label="ISBN"
            ref={registerFormGroup("isbn")}
          >
            <CustomInput
              error={errors?.isbn}
              value={form.isbn}
              onChange={handleFormInput}
              placeholder="ISBN"
              name="isbn"
            />
          </FieldRow>

          <div className="mb-5 mt-3">
            <h1 className="text-2xl dark:text-white">Copies</h1>
            <hr className="mb-5 h-px my-3 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          </div>

          <div>
            <div className="mb-2">
              <Button color="primary" outline={true} onClick={addCopy}>
                <div className="flex gap-2 items-center">
                  <AiOutlinePlus /> Add copy
                </div>
              </Button>
            </div>
            <Table>
              <Table.Head>
                <Table.HeadCell>Accession number</Table.HeadCell>
                <Table.HeadCell>Copy number</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {form.accessions.map((v, index) => {
                  return (
                    <Table.Row key={index}>
                      <Table.Cell>
                        <div
                          ref={registerFormGroup(`accessions[${index}].number`)}
                        >
                          <CustomInput
                            value={v.number}
                            error={errors?.accessions?.[index]?.number}
                            type="number"
                            onChange={(event) => {
                              const value = parseInt(event.target.value);
                              handleAccessionInput(index, value);
                            }}
                          />
                        </div>
                      </Table.Cell>
                      <Table.Cell>{v.copyNumber}</Table.Cell>
                      <Table.Cell>
                        <Button
                          color="failure"
                          size={"sm"}
                          disabled={form.accessions.length === 1}
                          onClick={() => {
                            removeCopy(v.copyNumber);
                          }}
                        >
                          <FaTimes />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
          <hr className="mb-5 h-px my-3 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          <FieldRow label="Pages" ref={registerFormGroup("pages")}>
            <CustomInput
              wrapperclass="flex flex-col"
              error={errors?.pages}
              type="number"
              value={form.pages}
              onChange={handleFormInput}
              placeholder="Number of pages"
              name="pages"
            />
          </FieldRow>
          <FieldRow
            label="Collection"
            isRequired
            ref={registerFormGroup("section.id")}
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
            ref={registerFormGroup("publisher.id")}
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
                color="primary"
                className="mt-0.5 ml-2"
                type="button"
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
              placeholder="Price"
              name="costPrice"
            />
          </FieldRow>
          <FieldRow label="Edition" ref={registerFormGroup("edition")}>
            <CustomInput
              error={errors?.edition}
              type="number"
              value={form.edition}
              onChange={handleFormInput}
              placeholder="Edition"
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
          <FieldRow label="Date Received" ref={registerFormGroup("receivedAt")}>
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
            fieldDetails="Brief Description of the reading material"
          >
            <Editor
              apiKey="dj5q6q3r4r8f9a9nt139kk6ba97ntgvdn3iiobqmeef4k4ei"
              onEditorChange={handleDescriptionInput}
              init={{
                body_class: "editor-body",
                statusbar: false,
              }}
            />
          </FieldRow>
          <FieldRow
            label="Book Cover"
            fieldDetails="Add image cover of the reading material"
          >
            <Dashboard
              uppy={uppy}
              width={"100%"}
              height={"450px"}
              hideUploadButton={true}
              showProgressDetails={true}
              className="bg-gray-50 dark:bg-gray-700"
              locale={{
                strings: {
                  browseFiles: " browse",
                  dropPasteFiles: "Drop an image or, click to %{browse}",
                },
              }}
            ></Dashboard>
          </FieldRow>

          <FieldRow
            label="eBook"
            fieldDetails="Upload eBook version of the reading material if available"
          >
            <Dashboard
              uppy={eBookUppy}
              width={"100%"}
              height={"250px"}
              hideUploadButton={true}
              showProgressDetails={true}
              className="bg-gray-50 dark:bg-gray-700"
              locale={{
                strings: {
                  browseFiles: "browse",
                  dropPasteFiles: "Drop the PDF here, click to %{browse}",
                },
              }}
            ></Dashboard>
          </FieldRow>
        </Container>
        <Container>
          <div className="mb-5 mt-3">
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

          <hr className="mb-5 h-px my-3 bg-gray-200 border-0 dark:bg-gray-700"></hr>

          <FieldRow
            fieldDetails="The book classification based on Dewey Decimal Classification"
            label="DDC"
            ref={registerFormGroup("ddc")}
          >
            <div className="w-full h-full flex ">
              <CustomInput
                className="flex-1"
                type="number"
                error={errors?.ddc}
                value={form.ddc}
                onChange={handleFormInput}
                placeholder="DDC"
                name="ddc"
              />
              <Button
                type="button"
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
                outline
                gradientDuoTone="primaryToPrimary"
                className="border border-primary-500 text-primary-500 dark:border-primary-500 dark:text-primary-400 self-start ml-2 text-sm"
                type="button"
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
            ref={registerFormGroup("searchTags")}
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
              value={form.searchTags.map((v) => ({ value: v, label: v }))}
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
            <div>
              <Button
                color="primary"
                type="submit"
                isProcessing={newBook.isLoading}
              >
                Add to Collection
              </Button>
            </div>
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

export default BookAddForm;
