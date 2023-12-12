import { ChangeEvent, FormEvent, useState } from "react";
import Modal, { ModalProps } from "react-responsive-modal";

interface BookTypeSelectionProps extends ModalProps {
  onSelect: (selectedType: "physical" | "ebook") => void;
}
const BookTypeSelectionModal = ({
  onClose,
  open,

  onSelect,
}: BookTypeSelectionProps) => {
  const [selected, setSelected] = useState<"ebook" | "physical">("physical");
  const onProceed = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSelect(selected);
    onClose();
  };
  const handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "physical") {
      setSelected("physical");
      return;
    }
    if (value === "ebook") {
      setSelected("ebook");
      return;
    }
  };
  if (!open) return null;
  return (
    <Modal
      onClose={onClose}
      center
      closeOnOverlayClick
      showCloseIcon={false}
      open={open}
      classNames={{
        modal: "w-11/12 md:w-7/12 lg:w-3/12 rounded",
      }}
      styles={{
        modal: {
          maxWidth: "500px",
        },
      }}
    >
      <div>
        <div className="py-2">
          <h2 className="text-lg font-semibold">Select book type</h2>
        </div>

        <form onSubmit={onProceed}>
          <div className="py-2">
            <select
              className="select select-bordered w-full"
              value={selected}
              onChange={handleOnChange}
            >
              <option value="physical">Physical Book</option>
              <option value="ebook">Ebook</option>
            </select>
          </div>
          <div className="py-2">
            <button className="btn btn-primary btn-sm" type="submit">
              Proceed
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BookTypeSelectionModal;
