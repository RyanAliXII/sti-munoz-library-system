import { ModalProps, ScannerAccount } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { BaseSyntheticEvent } from "react";

import { NewAccountValidation } from "../schema";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import Modal from "react-responsive-modal";
import {
  Input,
  InputClasses,
  TextAreaClasses,
} from "@components/ui/form/Input";
import { LighButton, PrimaryButton } from "@components/ui/button/Button";

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
    <Modal
      open={isOpen}
      onClose={closeModal}
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      center
    >
      <form onSubmit={handleSubmit}>
        <div className="w-full h-46 mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">New Account</h1>
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Username"
              name="username"
              onChange={handleFormInput}
              error={errors?.username}
            />
          </div>
          <div className="px-2 mb-2">
            <Input
              label="Password"
              type="password"
              name="password"
              onChange={handleFormInput}
              error={errors?.password}
            />
          </div>
          <div className="px-2 mb-2">
            <label className={InputClasses.LabelClasslist}>Description</label>
            <textarea
              className={
                errors?.description
                  ? TextAreaClasses.ErrorClasslist
                  : TextAreaClasses.DefaultClasslist
              }
              onChange={handleFormInput}
              name="description"
              maxLength={150}
            />
            <div className="h-2 flex items-center mt-2">
              <small className="text-red-500 ml-1">{errors?.description}</small>
            </div>
          </div>

          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Save</PrimaryButton>
            <LighButton onClick={closeModal} type="button">
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NewAccountModal;
