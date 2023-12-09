import CustomSelect from "@components/ui/form/CustomSelect";
import {
  Account,
  ModalProps,
  UserProgramOrStrand,
  UserType,
} from "@definitions/types";
import { useAccountActivation } from "@hooks/data-fetching/account";
import { useUserProgramsByType, useUserTypes } from "@hooks/data-fetching/user";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "flowbite-react";
import { Dispatch, FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { SingleValue } from "react-select";
import { toast } from "react-toastify";
import { boolean, number, object } from "yup";
import { SelectedAccountIdsAction } from "./selected-account-ids-reducer";

type ActivateForm = {
  userType: UserType;
  program: Omit<UserProgramOrStrand, "userType">;
};
interface ActivateModalProps extends ModalProps {
  selectedAccounts: Map<string, Account>;
  dispatchSelection: Dispatch<SelectedAccountIdsAction>;
}
const ActivateModal: FC<ActivateModalProps> = ({
  closeModal,
  isOpen,
  selectedAccounts,
  dispatchSelection,
}) => {
  const { data: userTypes } = useUserTypes({});
  const {
    form,
    setForm,
    validate,
    errors,
    removeFieldError,
    setErrors,
    resetForm,
  } = useForm<ActivateForm>({
    initialFormData: {
      program: {
        code: "",
        id: 0,
        name: "",
        userTypeId: 0,
      },
      userType: {
        hasProgram: false,
        id: 0,
        name: "",
      },
    },
    schema: object({
      userType: object({
        id: number()
          .required("User group is required.")
          .typeError("User group is required.")
          .min(1, "User group is required."),
        hasProgram: boolean(),
      }),
    }),
  });
  const queryClient = useQueryClient();
  const activateAccounts = useAccountActivation({
    onSuccess: () => {
      toast.success("Account/s have been activated.");
      queryClient.invalidateQueries(["accounts"]);
      dispatchSelection({ type: "unselect-all", payload: {} });
    },
  });

  const { data: programs } = useUserProgramsByType({
    queryKey: ["programsByType", form.userType.id, form.userType.hasProgram],
  });
  const handleUserGroupSelection = (newValue: SingleValue<UserType>) => {
    removeFieldError("userType.id");
    setForm((prev) => ({ ...prev, userType: newValue as UserType }));
  };
  const handleProgramSelection = (
    newValue: SingleValue<UserProgramOrStrand>
  ) => {
    removeFieldError("program.id");
    setForm((prev) => ({ ...prev, program: newValue as UserProgramOrStrand }));
  };
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const form = await validate();
      if (form?.userType.hasProgram && form.program.id === 0) {
        setErrors({
          program: {
            id: "Program is required.",
          },
        });
        return;
      }
      if (!form) return;
      activateAccounts.mutate({
        accountIds: Array.from(selectedAccounts.keys()),
        programId: form?.program.id,
        userTypeId: form?.userType.id,
      });
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };
  useModalToggleListener(isOpen, () => {
    if (isOpen) return;
    resetForm();
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>Activate Account</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <CustomSelect
              error={errors?.userType?.id}
              options={userTypes ?? []}
              onChange={handleUserGroupSelection}
              getOptionLabel={(t) => t.name}
              getOptionValue={(t) => t.id.toString()}
              label="User Group"
            />
          </div>
          {form.userType.hasProgram && (
            <div className="pb-2">
              <CustomSelect
                onChange={handleProgramSelection}
                error={errors?.program?.id}
                label="Program/Strand"
                options={programs ?? []}
                getOptionLabel={(p) => p.name}
                getOptionValue={(p) => p.id.toString()}
              />
            </div>
          )}
          <div className="p">
            <Button color="primary" type="submit">
              <div className="flex items-center gap-1">
                <FaSave /> Save
              </div>
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default ActivateModal;