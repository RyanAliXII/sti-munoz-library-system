import { ModalProps } from "@definitions/types";
import { useExportClientLogs } from "@hooks/data-fetching/patron-log";
import { useForm } from "@hooks/useForm";
import { Button, Label, Modal, Select } from "flowbite-react";
import { FC, FormEvent } from "react";
import { AiOutlineDownload } from "react-icons/ai";

interface ClientLogExportModalProps extends ModalProps {
  filters: any;
}
const ExportModal: FC<ClientLogExportModalProps> = ({
  isOpen,
  closeModal,
  filters,
}) => {
  const { form, handleFormInput } = useForm({
    initialFormData: {
      fileType: ".csv",
    },
  });
  const exportLogs = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    refetch();
  };

  const { isFetching, refetch } = useExportClientLogs({
    queryKey: ["exportLogs", form.fileType, filters],
  });

  return (
    <Modal show={isOpen} onClose={closeModal}>
      <Modal.Header>File Format</Modal.Header>
      <Modal.Body>
        <form onSubmit={exportLogs}>
          <div className="pb-2">
            <Label>Select file format</Label>
            <Select
              value={form.fileType}
              name="fileType"
              onChange={handleFormInput}
            >
              <option value=".csv">CSV</option>
              <option value=".xlsx">Excel</option>
            </Select>
          </div>
          <Button
            color="primary"
            type="submit"
            className="mt-1"
            isProcessing={isFetching}
            disabled={isFetching}
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

export default ExportModal;
