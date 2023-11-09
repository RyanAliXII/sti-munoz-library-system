import { ModalProps, ScannerAccount } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { BaseSyntheticEvent } from "react";

import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { NewAccountValidation } from "../schema";

import { CustomInput } from "@components/ui/form/Input";
import { Button, Label, Modal, Textarea } from "flowbite-react";

const NewAccountModal = ({ isOpen, closeModal }: ModalProps) => {
  const { errors, handleFormInput, validate, setErrors } =
    useForm<ScannerAccount>({
      initialFormData: {
        description: "",
        username: "",
        password: "",
      },
      schema: NewAccountValidation,
    });

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
  const { Post } = useRequest();
  const queryClient = useQueryClient();
  const newAccount = useMutation({
    mutationFn: (body: ScannerAccount) => Post("/scanner-accounts/", body),
    onError: (err: AxiosError<any, any>) => {
      const { data } = err?.response?.data;
      if (data?.errors) {
        setErrors(data?.errors);
        return;
      }
      closeModal();
    },
    onSuccess: () => {
      toast.success("Account has been created.");
      queryClient.invalidateQueries(["scannerAccounts"]);
      closeModal();
    },
  });
  return (
    <Modal show={isOpen} onClose={closeModal} size="2xl">
      <Modal.Header>New Account</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div>
            <div className="px-2 mb-2">
              <CustomInput
                label="Username"
                name="username"
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

export default NewAccountModal;
