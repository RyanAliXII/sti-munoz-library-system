import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import {
  Input,
  InputClasses,
  TextAreaClasses,
} from "@components/ui/form/Input";
import {
  Table,
  HeadingRow,
  Tbody,
  Th,
  Thead,
} from "@components/ui/table/Table";
import {
  ModalProps,
  ScannerAccount as ScannerAccountType,
} from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useSwitch } from "@hooks/useToggle";

import { AiOutlinePlus } from "react-icons/ai";
import Modal from "react-responsive-modal";
import { NewAccountValidation } from "./schema";
import { BaseSyntheticEvent, FormEventHandler } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";

const ScannerAccount = () => {
  const {
    close: closeAddAccountModal,
    isOpen: isAddAccountModalOpen,
    open: openAddAccountModal,
  } = useSwitch();
  return (
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10">
      <div className="w-full flex justify-between mb-5">
        <h1 className="text-2xl">Scanner Account</h1>
        <PrimaryButton
          className="flex items-center gap-2"
          onClick={openAddAccountModal}
        >
          <AiOutlinePlus />
          New Account
        </PrimaryButton>
      </div>

      <div>
        <LoadingBoundaryV2 isError={false} isLoading={false}>
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Username</Th>
                <Th>Description</Th>
                <Th></Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody></Tbody>
          </Table>
        </LoadingBoundaryV2>
      </div>
      <NewAccountModal
        closeModal={closeAddAccountModal}
        isOpen={isAddAccountModalOpen}
      />
    </div>
  );
};

const NewAccountModal = ({ isOpen, closeModal }: ModalProps) => {
  const { errors, form, handleFormInput, validate } =
    useForm<ScannerAccountType>({
      initialFormData: {
        description: "",
        username: "",
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
  const newAccount = useMutation({
    mutationFn: (body: ScannerAccountType) => Post("/scanner-accounts/", body),
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

export default ScannerAccount;
