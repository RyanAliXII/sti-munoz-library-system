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
import { CustomInput } from "@components/ui/form/Input";

type ActivateForm = {
  userType: UserType;
  program: Omit<UserProgramOrStrand, "userType">;
  studentNumber: string;
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
    handleFormInput,
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
        maxUniqueDeviceReservationPerDay: 0,
        id: 0,
        maxAllowedBorrowedBooks: 0,
        name: "",
      },
      studentNumber: "",
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
    setForm((prev) => ({
      ...prev,
      userType: newValue as UserType,
      program: { code: "", id: 0, name: "", userTypeId: 0 },
    }));
  };
  const handleProgramSelection = (
    newValue: SingleValue<Omit<UserProgramOrStrand, "userType">>
  ) => {
    removeFieldError("program.id");
    setForm((prev) => ({ ...prev, program: newValue as UserProgramOrStrand }));
  };
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const parsedForm = await validate();
      if (parsedForm?.userType.hasProgram && parsedForm.program.id === 0) {
        setErrors({
          program: {
            id: "Program is required.",
          },
        });
        return;
      }

      if (!parsedForm) return;

      activateAccounts.mutate({
        accountIds: Array.from(selectedAccounts.keys()),
        programId: parsedForm?.program.id,
        userTypeId: parsedForm?.userType.id,
        studentNumber: parsedForm?.studentNumber,
      });
      closeModal();
    } catch (error) {
      console.error(error);
    }
  };
  useModalToggleListener(isOpen, () => {
    if (isOpen) {
      if (selectedAccounts.size === 1) {
        const account = selectedAccounts.entries().next().value[1];

        setForm((f) => ({
          ...f,
          studentNumber: account.studentNumber,
          program: account.program,
          userType: account.userGroup,
        }));
      }
      return;
    }
    resetForm();
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>Enable Account</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <CustomSelect
              error={errors?.userType?.id}
              options={userTypes ?? []}
              value={form.userType}
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
                value={form.program}
                getOptionLabel={(p) => p.name}
                getOptionValue={(p) => p.id.toString()}
              />
            </div>
          )}
          {selectedAccounts.size === 1 && form.userType.hasProgram && (
            <CustomInput
              name="studentNumber"
              onChange={handleFormInput}
              label="Student number"
              value={form.studentNumber ?? ""}
            />
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
