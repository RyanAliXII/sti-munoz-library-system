import { ModalProps } from "@definitions/types";
import Uppy from "@uppy/core";
import DashboardComponent from "@uppy/react/src/Dashboard";
import { Label, Modal, Textarea } from "flowbite-react";
import { FC } from "react";
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".png", ".jpg", ".webp"],
    maxNumberOfFiles: 1,
  },
});

const SettleModal: FC<ModalProps> = ({ isOpen, closeModal }) => {
  const onSubmit = async () => {};
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible>
      <Modal.Header>Settle Penalty</Modal.Header>
      <Modal.Body>
        <form>
          <div className="pb-2">
            <Label>Remarks</Label>
            <Textarea />
          </div>
          <div className="pb-2">
            <Label>Proof of Payment</Label>
            <DashboardComponent
              width={"100%"}
              hideUploadButton={true}
              uppy={uppy}
              height={"400px"}
            />
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default SettleModal;
