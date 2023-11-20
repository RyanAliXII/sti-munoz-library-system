import { CustomInput } from "@components/ui/form/Input";
import { Game, ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { NewGameValidation } from "../schema";
import { useNewGame } from "@hooks/data-fetching/game";
import useModalToggleListener from "@hooks/useModalToggleListener";

const NewGameModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const { handleFormInput, form, validate, errors, resetForm } = useForm<
    Omit<Game, "id">
  >({
    initialFormData: {
      description: "",
      name: "",
    },
    schema: NewGameValidation,
  });
  useModalToggleListener(isOpen, () => {
    if (!isOpen) {
      resetForm();
    }
  });
  const newGame = useNewGame({
    onSuccess: () => {
      closeModal();
    },
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const game = await validate();
      if (!game) return;
      newGame.mutate(game);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Modal show={isOpen} dismissible onClose={closeModal} size={"xl"}>
      <Modal.Header>New Game</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <CustomInput
              label="Name"
              name="name"
              onChange={handleFormInput}
              value={form.name}
              error={errors?.name}
            />
          </div>
          <div className="pb-2">
            <Label>Description</Label>
            <Textarea
              className="resize-none"
              name="description"
              onChange={handleFormInput}
            />
            <small className="text-red-500 ">{errors?.description}</small>
          </div>
          <Button
            type="submit"
            color="primary"
            className="mt-2"
            isProcessing={newGame.isLoading}
          >
            <div className="flex gap-2 items-center">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default NewGameModal;
