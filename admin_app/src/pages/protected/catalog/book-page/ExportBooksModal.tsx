import { ModalProps } from "@definitions/types";
import { useCollections } from "@hooks/data-fetching/collection";
import { useExportBooks } from "@hooks/data-fetching/export-book";
import { useForm } from "@hooks/useForm";
import { Label, Modal, Select } from "flowbite-react";
import { ChangeEvent, FC } from "react";

const ExportBooksModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const { data: collections } = useCollections();
  const { form, setForm } = useForm<{
    collectionId: string;
    fileType: string;
  }>({
    initialFormData: {
      collectionId: "",
      fileType: ".xlsx",
    },
  });
  const onSelectColection = (event: ChangeEvent<HTMLSelectElement>) => {
    const collectionId = event.target.value ?? "";
    if (collectionId.length === 0) return;
    setForm((prev) => ({ ...prev, collectionId: collectionId }));
  };
  const onSelectFileType = (event: ChangeEvent<HTMLSelectElement>) => {
    const fileType = event.target.value ?? "";
    if (fileType != ".csv" && fileType != ".xlsx") return;
    setForm((prev) => ({ ...prev, fileType: fileType }));
  };

  const { data } = useExportBooks({
    queryKey: ["exporteBooks", form.collectionId, form.fileType],
  });

  return (
    <Modal show={isOpen} onClose={closeModal} size={"4xl"} dismissible={true}>
      <Modal.Header>Export Books</Modal.Header>
      <Modal.Body>
        <form>
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
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ExportBooksModal;
