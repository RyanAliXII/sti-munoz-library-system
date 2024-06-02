import { ModalProps } from "@definitions/types";
import { useExportBorrowedBooks } from "@hooks/data-fetching/borrowing";
import { useForm } from "@hooks/useForm";
import { Button, Label, Modal, Select } from "flowbite-react";
import { FC, FormEvent } from "react";
import { AiOutlineDownload } from "react-icons/ai";

interface BorrowedBookModalProps extends ModalProps {
  filters: any;
}
const ExportBorrowedBookModal: FC<BorrowedBookModalProps> = ({
  closeModal,
  isOpen,
  filters,
}) => {
  const { form, handleFormInput } = useForm({
    initialFormData: {
      fileType: ".csv",
    },
  });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    refetch();
  };
  const { refetch, isFetching } = useExportBorrowedBooks({
    queryKey: ["exportBorrowedBooks", form.fileType, filters],
  });
  return (
    <Modal show={isOpen} onClose={closeModal}>
      <Modal.Header>File Format</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <Label>Select file type</Label>
          <Select
            value={form.fileType}
            onChange={handleFormInput}
            name="fileType"
          >
            <option value=".csv">CSV</option>
            <option value=".xlsx">Excel</option>
          </Select>
          <Button
            color="primary"
            type="submit"
            className="mt-2"
            disabled={isFetching}
            isProcessing={isFetching}
          >
            <div className="flex gap-1 items-center">
              <AiOutlineDownload />
              Download
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ExportBorrowedBookModal;
