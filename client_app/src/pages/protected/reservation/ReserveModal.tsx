import CustomSelect from "@components/ui/form/CustomSelect";
import { ModalProps } from "@definitions/types";
import { tr } from "date-fns/locale";
import { FC } from "react";
import Modal from "react-responsive-modal";

const ReserveModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const handleDeviceSelection = () => {};
  if (!isOpen) return null;
  return (
    <Modal
      onClose={closeModal}
      open={isOpen}
      center
      styles={{
        modal: {
          overflowY: "visible",
          maxWidth: "450px",
        },
      }}
      closeOnOverlayClick={true}
      classNames={{
        modal: "w-11/12 md:w-7/12 lg:w-3/12 rounded",
      }}
    >
      <div>
        <div className="py-3">
          <h1 className="text-lg font-semibold">Select Device and Time</h1>
        </div>
        <form>
          <div className="pb-2">
            <CustomSelect label="Device" onChange={handleDeviceSelection} />
          </div>
          <div className="pb-2">
            <CustomSelect label="Time" onChange={handleDeviceSelection} />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ReserveModal;
