import { CustomInput } from "@components/ui/form/Input";
import { Game, ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { NewGameValidation } from "../schema";
import { useEditGame, useNewGame } from "@hooks/data-fetching/game";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { EditModalProps } from "@pages/protected/system/access-control/EditRoleModal";

const EditGameModal: FC<EditModalProps<Game>> = ({
  closeModal,
  isOpen,
  formData,
}) => {
  const { handleFormInput, form, validate, errors, resetForm, setForm } =
    useForm<Game>({
      initialFormData: {
        id: "",
        description: "",
        name: "",
      },
      schema: NewGameValidation,
    });
  useModalToggleListener(isOpen, () => {
    if (!isOpen) {
      resetForm();
      return;
    }
    setForm(formData);
  });
  const queryClient = useQueryClient();
  const editGame = useEditGame({
    onSuccess: () => {
      closeModal();
      toast.success("Game has been updated.");
      queryClient.invalidateQueries(["games"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const game = await validate();
      if (!game) return;
      editGame.mutate(game);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Modal show={isOpen} dismissible onClose={closeModal} size={"xl"}>
      <Modal.Header>Edit Game</Modal.Header>
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
              value={form.description}
              onChange={handleFormInput}
            />
            <small className="text-red-500 ">{errors?.description}</small>
          </div>
          <Button
            type="submit"
            color="primary"
            className="mt-2"
            isProcessing={editGame.isLoading}
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

export default EditGameModal;
