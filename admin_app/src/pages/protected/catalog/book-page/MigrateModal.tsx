import CustomSelect from "@components/ui/form/CustomSelect";
import { ModalProps, Section } from "@definitions/types";
import { useCollections } from "@hooks/data-fetching/collection";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent, useState } from "react";
import { SingleValue } from "react-select";

interface MigrateModalProps extends ModalProps {
  onProceed?: (section: Section) => void;
}
const MigrateModal: FC<MigrateModalProps> = ({
  isOpen,
  closeModal,
  onProceed,
}) => {
  const [collection, setCollection] = useState<Section>();
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!collection) return;
    closeModal();
    onProceed?.(collection);
  };
  const { data: collections } = useCollections();
  const handleSelect = (c: SingleValue<Section>) => {
    setCollection(c as Section);
  };
  return (
    <Modal show={isOpen} dismissible onClose={closeModal} size="lg">
      <Modal.Header>Migrate to Another Collection</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <CustomSelect
              label="Collection"
              options={collections}
              onChange={handleSelect}
              getOptionLabel={(option) => option.name}
              isOptionSelected={(option) => option?.id === collection?.id}
              getOptionValue={(option) => option.id?.toString() ?? ""}
            />
          </div>
          <div className="pb-2">
            <Button color="primary" disabled={!collection} type="submit">
              Proceed
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default MigrateModal;
