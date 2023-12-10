import ClientSearchBox from "@components/ClientSearchBox";
import CustomSelect from "@components/ui/form/CustomSelect";
import FieldError from "@components/ui/form/FieldError";
import { Account, Game, GameLog, ModalProps } from "@definitions/types";
import { useGame, useGameLog } from "@hooks/data-fetching/game";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { SingleValue } from "react-select";
import { toast } from "react-toastify";
import { LogGameValidation } from "../../schema";
const NewLogModal: FC<ModalProps> = ({ closeModal, isOpen }) => {
  const { data: game } = useGame({});
  const {
    setForm,
    errors,
    validate,
    removeErrors,
    removeFieldError,
    resetForm,
  } = useForm<
    Omit<
      GameLog,
      "id" | "client" | "game" | "createdAt" | "loggedOutAt" | "isLoggedOut"
    >
  >({
    initialFormData: {
      accountId: "",
      gameId: "",
    },
    schema: LogGameValidation,
  });
  const onSelectClient = (client: Account) => {
    const clientId = client?.id;
    removeFieldError("accountId");
    if (!clientId) return;
    setForm((prev) => ({ ...prev, accountId: clientId }));
  };
  const onSelectGame = (value: SingleValue<Game>) => {
    if (!value) return;
    removeFieldError("gameId");
    setForm((prev) => ({ ...prev, gameId: value.id }));
  };
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      removeErrors();
      event.preventDefault();
      const gameLog = await validate();
      if (!gameLog) return;
      log.mutate(gameLog);
    } catch (error) {
      console.error(error);
    }
  };
  const queryClient = useQueryClient();
  const log = useGameLog({
    onSuccess: () => {
      toast.success("Game has been logged.");
      queryClient.invalidateQueries(["gameLogs"]);
      closeModal();
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  useModalToggleListener(isOpen, () => {
    if (!isOpen) resetForm();
  });
  return (
    <Modal onClose={closeModal} show={isOpen} size="xl" dismissible>
      <Modal.Header>New Log</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <ClientSearchBox className="w-full" setClient={onSelectClient} />
          </div>
          <FieldError error={errors?.accountId}></FieldError>
          <div className="py-2">
            <CustomSelect
              label="Game"
              options={game}
              onChange={onSelectGame}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option?.id?.toString() ?? ""}
            />
            <FieldError error={errors?.gameId}></FieldError>
          </div>
          <Button color="primary" type="submit" isProcessing={log.isLoading}>
            <div className="flex items-center gap-1">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default NewLogModal;
