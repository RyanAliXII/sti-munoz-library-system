import { useMsal } from "@azure/msal-react";
import { PrimaryButton } from "@components/ui/button/Button";
import CustomSelect from "@components/ui/form/CustomSelect";
import { InputClasses } from "@components/ui/form/Input";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { apiScope } from "@definitions/configs/msal/scopes";
import { ModalProps, Section } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { FormEvent } from "react";
import Modal from "react-responsive-modal";
import { number, object, string } from "yup";

const TW0_SECONDS = 2000;
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".csv"],
    maxNumberOfFiles: 1,
  },
  infoTimeout: TW0_SECONDS,
}).use(XHRUpload, {
  fieldName: "file",
  bundle: true,
  headers: {},
  endpoint: `${BASE_URL_V1}/books/bulk`,
});
const ImportBooksModal = ({ closeModal, isOpen }: ModalProps) => {
  const { Get } = useRequest();
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
    initialFormData: {
      hasOwnAccession: false,
      name: "",
      prefix: " ",
      id: 0,
    },
    schema: object({
      id: number()
        .min(1, "Section is required.")
        .required("Section is required.")
        .typeError("Section is required."),
    }),
  });
  const { instance: msalInstance } = useMsal();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await validate();
      const tokens = await msalInstance.acquireTokenSilent({
        scopes: [apiScope("Book.Add")],
      });
      uppy.getPlugin("XHRUpload")?.setOptions({
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      uppy.setMeta({
        sectionId: form.id,
      });
      uppy.upload();
    } catch (error) {}
  };
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      styles={{}}
      classNames={{
        modal: "w-11/12  lg:w-12/12  xl: rounded h-[900-px]",
      }}
    >
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
