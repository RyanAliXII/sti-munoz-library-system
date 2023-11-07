import { PrimaryButton } from "@components/ui/button/Button";
import CustomSelect from "@components/ui/form/CustomSelect";
import { InputClasses } from "@components/ui/form/Input";

import { ModalProps, Section } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/src/Dashboard";
import { AxiosError } from "axios";

import { FormEvent, useEffect, useState } from "react";
import { Button, Modal, Select } from "flowbite-react";
import { toast } from "react-toastify";
import { number, object } from "yup";

const TW0_SECONDS = 2000;
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".csv"],
    maxNumberOfFiles: 1,
  },
  infoTimeout: TW0_SECONDS,
});
type ParseErr = {
  column: number;
  row: number;
  message: string;
};
const INITIAL_FORM_VALUE = {
  hasOwnAccession: false,
  name: "",
  prefix: " ",
  id: 0,
};
const ImportBooksModal = ({ closeModal, isOpen }: ModalProps) => {
  const { Get } = useRequest();

  const [error, setError] = useState<undefined | ParseErr>(undefined);
  const fetchSections = async () => {
    try {
      const { data: response } = await Get("/sections/", {});
      return response.data?.sections ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const { data: sections } = useQuery<Section[]>({
    queryFn: fetchSections,

    queryKey: ["sections"],
  });
  const queryClient = useQueryClient();
  const { form, setForm, errors, validate, handleFormInput } = useForm<Section>(
    {
      initialFormData: INITIAL_FORM_VALUE,
      schema: object({
        id: number()
          .min(1, "Section is required.")
          .required("Section is required.")
          .typeError("Section is required."),
      }),
    }
  );
  const { Post } = useRequest();
  const importBooks = useMutation({
    mutationFn: (formData: FormData) => Post("/books/bulk", formData),
    onSuccess: () => {
      uppy.getFiles().forEach((uppyFile) => {
        uppy.removeFile(uppyFile.id);
      });
      queryClient.invalidateQueries(["books"]);
      toast.success("Books imported.");
    },
    onError: (error: AxiosError<any, any>) => {
      if (error.response?.status === 400) {
        const { data } = error.response?.data;
        const specificError = data?.errors as ParseErr;
        if (specificError) {
          setError(specificError);
        }
      }
    },
  });
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("submit");
    try {
      await validate();
      if (uppy.getFiles().length === 0) return;
      setError(undefined);
      const formData = new FormData();
      const file = uppy.getFiles()[0].data;
      formData.append("file", file);
      formData.append("sectionId", form?.id?.toString() ?? "");
      importBooks.mutate(formData);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!isOpen) {
      setError(undefined);
      setForm(INITIAL_FORM_VALUE);
    }
  }, [isOpen]);
  return (
    <Modal show={isOpen} size={"3xl"} onClose={closeModal} dismissible>
      <Modal.Body>
        {error && (
          <div
            className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50  dark:text-red-400 "
            role="alert"
          >
            <svg
              className="flex-shrink-0 inline w-4 h-4 mr-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-medium">{`Row: ${error?.row} Column: ${error?.column}`}</span>{" "}
              {error?.message}
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mt-5">
            <Select name="id" onChange={handleFormInput}>
              {sections?.map((section) => {
                return (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                );
              })}
            </Select>
            <div className="mb-2 mt-3">
              <label className={InputClasses.LabelClasslist}>File</label>
              <Dashboard
                uppy={uppy}
                width={"100%"}
                height={"450px"}
                hideUploadButton={true}
                locale={{
                  strings: {
                    browseFiles: "browse",
                    dropPasteFiles:
                      "Drop a .csv list of book click to %{browse}",
                  },
                }}
              />
            </div>

            <Button
              color="primary"
              type="submit"
              isProcessing={importBooks.isLoading}
            >
              Submit
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ImportBooksModal;
