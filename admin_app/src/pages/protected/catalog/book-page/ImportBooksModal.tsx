import { PrimaryButton } from "@components/ui/button/Button";
import CustomSelect from "@components/ui/form/CustomSelect";
import { InputClasses } from "@components/ui/form/Input";
import { ModalProps } from "@definitions/types";
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
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      styles={{}}
      classNames={{
        modal: "w-11/12  lg:w-12/12  xl: rounded h-[900-px]",
      }}
    >
      <div>
        <CustomSelect label="Section" placeholder="Select section" />
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
