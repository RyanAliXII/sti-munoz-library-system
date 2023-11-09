import { ModalProps, ScannerAccount } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { BaseSyntheticEvent, useEffect } from "react";

import { EditAccountValidation } from "../schema";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { CustomInput } from "@components/ui/form/Input";

interface EditAccountModalProps extends ModalProps {
  account: ScannerAccount;
}
const EditAccountModal = ({
  isOpen,
  closeModal,
  account,
}: EditAccountModalProps) => {
  const { errors, handleFormInput, validate, setForm, form, setErrors } =
    useForm<ScannerAccount>({
      initialFormData: {
        description: "",
        username: "",
      },
      schema: EditAccountValidation,
    });
  useEffect(() => {
    if (isOpen) {
      setForm(account);
    }
  }, [isOpen]);

  const handleSubmit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      const body = await validate();
      if (body) {
        newAccount.mutate(body);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const { Put } = useRequest();
  const queryClient = useQueryClient();
  const newAccount = useMutation({
    mutationFn: (body: ScannerAccount) =>
      Put(`/scanner-accounts/${form.id}`, body),
    onError: (err: AxiosError<any, any>) => {
      const { data } = err?.response?.data;
      if (data?.errors) {
        setErrors(data?.errors);
        return;
      }
      closeModal();
      toast.error("Unknown error occured.");
    },
    onSuccess: () => {
      toast.success("Account has been updated.");
      queryClient.invalidateQueries(["scannerAccounts"]);
      closeModal();
    },
  });
  return (
    <Modal show={isOpen} onClose={closeModal} size="2xl">
      <Modal.Header>Edit Account</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div>
            <div className="px-2 mb-2">
              <CustomInput
                label="Username"
                name="username"
                value={form.username}
                onChange={handleFormInput}
                error={errors?.username}
              />
            </div>
            <div className="px-2 mb-2">
              <CustomInput
                label="Password"
                type="password"
                name="password"
                onChange={handleFormInput}
                error={errors?.password}
              />
            </div>
            <div className="px-2 mb-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                className="resize-none"
                onChange={handleFormInput}
                name="description"
                maxLength={150}
              />
              <div className="h-2 flex items-center mt-2">
                <small className="text-red-500 ml-1">
                  {errors?.description}
                </small>
              </div>
            </div>

            <div className="flex gap-1 mt-2 p-2">
              <Button
                color="primary"
                isProcessing={newAccount.isLoading}
                type="submit"
              >
                Save
              </Button>
              <Button color="light" onClick={closeModal} type="button">
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};
export default EditAccountModal;
