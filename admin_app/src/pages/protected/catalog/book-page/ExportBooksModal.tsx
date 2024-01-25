import { ModalProps } from "@definitions/types";
import { useCollections } from "@hooks/data-fetching/collection";
import { useExportBooks } from "@hooks/data-fetching/export-book";
import { useForm } from "@hooks/useForm";
import { Button, Label, Modal, Select } from "flowbite-react";
import { ChangeEvent, FC, FormEvent } from "react";
import { AiOutlineDownload } from "react-icons/ai";
const ExportBooksModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const { data: collections } = useCollections();
  const { form, setForm } = useForm<{
    collectionId: number;
    fileType: string;
  }>({
    initialFormData: {
      collectionId: 0,
      fileType: ".xlsx",
    },
  });
  const onSelectColection = (event: ChangeEvent<HTMLSelectElement>) => {
    const collectionId = parseInt(event.target.value ?? "");
    if (collectionId === 0 || isNaN(collectionId)) return;
    setForm((prev) => ({ ...prev, collectionId: collectionId }));
  };
  const onSelectFileType = (event: ChangeEvent<HTMLSelectElement>) => {
    const fileType = event.target.value ?? "";
    if (fileType != ".csv" && fileType != ".xlsx") return;
    setForm((prev) => ({ ...prev, fileType: fileType }));
  };

  const {
    data: document,
    isFetching,
    refetch,
  } = useExportBooks({
    queryKey: ["exporteBooks", form.collectionId, form.fileType],
  });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    refetch();
  };
  return (
    <Modal show={isOpen} onClose={closeModal} size={"2xl"} dismissible={true}>
      <Modal.Header>Export Books</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div>
            <div className="py-2">
              <Label>Collection</Label>
              <Select
                name="id"
                onChange={onSelectColection}
                value={form.collectionId}
              >
                <option value="">Select Collection</option>
                {collections?.map((collection) => {
                  return (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  );
                })}
              </Select>
            </div>
            <div className="py-2">
              <Label>File format</Label>
              <Select
                name="id"
                onChange={onSelectFileType}
                value={form.fileType}
              >
                <option value=".xlsx">Excel(.xlsx)</option>
                <option value=".csv">CSV(.csv)</option>
              </Select>
            </div>
          </div>
          <div className="py-2">
            <Button
              color="primary"
              isProcessing={isFetching}
              type="submit"
              disabled={form.collectionId == 0}
            >
              <div className="flex gap-1 items-center">
                <AiOutlineDownload />
                Download
              </div>
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ExportBooksModal;
