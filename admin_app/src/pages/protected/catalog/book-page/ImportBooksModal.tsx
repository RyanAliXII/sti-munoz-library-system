import { PrimaryButton } from "@components/ui/button/Button";
import CustomSelect from "@components/ui/form/CustomSelect";
import { InputClasses } from "@components/ui/form/Input";
import { apiScope } from "@definitions/configs/msal/scopes";
import { ModalProps, Section } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/react/src/Dashboard";
import Modal from "react-responsive-modal";

const TW0_SECONDS = 2000;
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".csv"],
    maxNumberOfFiles: 1,
  },
  infoTimeout: TW0_SECONDS,
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

  const { form, setForm } = useForm<Section>({
    initialFormData: {
      hasOwnAccession: false,
      name: "",
      prefix: " ",
      id: 0,
    },
  });
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      styles={{}}
      classNames={{
        modal: "w-11/12  lg:w-12/12  xl: rounded h-[900-px]",
      }}
    >
      <div className="mt-5">
        <CustomSelect
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
    </Modal>
  );
};

export default ImportBooksModal;
