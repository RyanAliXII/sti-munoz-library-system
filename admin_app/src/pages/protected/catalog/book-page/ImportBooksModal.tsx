import { useMsal } from "@azure/msal-react";
import { PrimaryButton } from "@components/ui/button/Button";
import CustomSelect from "@components/ui/form/CustomSelect";
import { InputClasses } from "@components/ui/form/Input";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import axiosClient from "@definitions/configs/axios";
import { apiScope } from "@definitions/configs/msal/scopes";
import { ModalProps, Section } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { AxiosError } from "axios";
import { FormEvent, useEffect, useState } from "react";
import { MdOutlineError } from "react-icons/md";
import Modal from "react-responsive-modal";
import { number, object, string } from "yup";

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
      const { data: response } = await Get("/sections/", {}, [
        apiScope("Section.Read"),
      ]);
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

  const { form, setForm, errors, validate } = useForm<Section>({
    initialFormData: INITIAL_FORM_VALUE,
    schema: object({
      id: number()
        .min(1, "Section is required.")
        .required("Section is required.")
        .typeError("Section is required."),
    }),
  });
  const { Post } = useRequest();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await validate();
    try {
      if (uppy.getFiles().length === 0) return;
      setError(undefined);
      const formData = new FormData();
      const file = uppy.getFiles()[0].data;
      formData.append("file", file);
      formData.append("sectionId", form?.id?.toString() ?? "");
      await Post("/books/bulk", formData);
      uppy.getFiles().forEach((uppyFile) => {
        uppy.removeFile(uppyFile.id);
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          const { data } = error.response?.data;
          const specificError = data?.errors as ParseErr;
          if (specificError) {
            setError(specificError);
          }
        }
      }
    }
  };
  useEffect(() => {
    if (!isOpen) {
      setError(undefined);
      setForm(INITIAL_FORM_VALUE);
    }
  }, [isOpen]);
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      styles={{}}
      showCloseIcon={false}
      classNames={{
        modal: "w-11/12  lg:w-12/12  xl: rounded h-[900-px]",
      }}
    >
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
          <CustomSelect
            error={errors?.id}
            label="Section"
            placeholder="Select section"
            value={form}
            className="w-full"
            options={sections}
            onChange={(value) => setForm(value as Section)}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option?.id?.toString() ?? ""}
          />
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
                  dropPasteFiles: "Drop a .csv list of book click to %{browse}",
                },
              }}
            />
          </div>

          <PrimaryButton>Submit</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
};

export default ImportBooksModal;
