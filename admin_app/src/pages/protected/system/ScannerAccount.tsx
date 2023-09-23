import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import {
  ButtonClasses,
  LighButton,
  PrimaryButton,
} from "@components/ui/button/Button";
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
  BodyRow,
  Td,
} from "@components/ui/table/Table";
import {
  ModalProps,
  ScannerAccount as ScannerAccountType,
} from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useSwitch } from "@hooks/useToggle";

import { AiOutlineEdit, AiOutlinePlus } from "react-icons/ai";
import Modal from "react-responsive-modal";
import { EditAccountValidation, NewAccountValidation } from "./schema";
import {
  BaseSyntheticEvent,
  FormEventHandler,
  useEffect,
  useState,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import { toast } from "react-toastify";
import Tippy from "@tippyjs/react";
import { Form } from "react-router-dom";
import { AxiosError, AxiosResponse } from "axios";
import { BsTrash, BsTrash2, BsTrashFill } from "react-icons/bs";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";

const ScannerAccount = () => {
  const { Get, Delete } = useRequest();
  const [selectedAccount, setSelectedAccount] = useState<ScannerAccountType>({
    description: "",
    username: "",
    id: "",
    password: "",
  });
  const fetchAccounts = async () => {
    try {
      const { data: response } = await Get("/scanner-accounts/");
      return response?.data?.scannerAccounts ?? [];
    } catch (error) {
      return [];
    }
  };
  const { data: scannerAccounts } = useQuery<ScannerAccountType[]>({
    queryFn: fetchAccounts,
    queryKey: ["scannerAccounts"],
  });
  const queryClient = useQueryClient();
  const deleteAccount = useMutation({
    mutationFn: () => Delete(`/scanner-accounts/${selectedAccount.id}`),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      queryClient.invalidateQueries(["scannerAccounts"]);
    },
    onError: () => {
      toast.error("Unknown error occurred.");
    },
  });
  const {
    close: closeAddAccountModal,
    isOpen: isAddAccountModalOpen,
    open: openAddAccountModal,
  } = useSwitch();
  const {
    close: closeEditAccountModal,
    isOpen: isEditAccountModalOpen,
    open: openEditAccountModal,
  } = useSwitch();
  const {
    close: closeDeleteConfirmation,
    isOpen: isDeleteConfirmationOpen,
    open: openDeleteConfirmation,
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
              </HeadingRow>
            </Thead>
            <Tbody>
              {scannerAccounts?.map((account) => {
                return (
                  <BodyRow key={account.id}>
                    <Td>{account.username}</Td>
                    <Td>{account.description}</Td>
                    <Td className="flex gap-2">
                      <Tippy content="Edit Account">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            openEditAccountModal();
                          }}
                          type="button"
                          className={
                            ButtonClasses.PrimaryOutlineButtonClasslist
                          }
                        >
                          <AiOutlineEdit />
                        </button>
                      </Tippy>
                      <Tippy content="Delete Account">
                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            openDeleteConfirmation();
                          }}
                          type="button"
                          className={ButtonClasses.DangerButtonOutlineClasslist}
                        >
                          <BsTrashFill />
                        </button>
                      </Tippy>
                    </Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </LoadingBoundaryV2>
      </div>
      <NewAccountModal
        key={"add"}
        closeModal={closeAddAccountModal}
        isOpen={isAddAccountModalOpen}
      />
      <EditAccountModal
        key={"edit"}
        account={selectedAccount}
        closeModal={closeEditAccountModal}
        isOpen={isEditAccountModalOpen}
      />
      <DangerConfirmDialog
        close={closeDeleteConfirmation}
        isOpen={isDeleteConfirmationOpen}
        title="Delete Scanner Account!"
        text="Are you sure you want to delete this account?"
        onConfirm={() => {
          deleteAccount.mutate();
        }}
      />
    </div>
  );
};

const NewAccountModal = ({ isOpen, closeModal }: ModalProps) => {
  const { errors, handleFormInput, validate, setErrors } =
    useForm<ScannerAccountType>({
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
    mutationFn: (body: ScannerAccountType) => Post("/scanner-accounts/", body),
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
interface EditAccountModalProps extends ModalProps {
  account: ScannerAccountType;
}
const EditAccountModal = ({
  isOpen,
  closeModal,
  account,
}: EditAccountModalProps) => {
  const { errors, handleFormInput, validate, setForm, form, setErrors } =
    useForm<ScannerAccountType>({
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
    mutationFn: (body: ScannerAccountType) =>
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
    <Modal
      open={isOpen}
      onClose={closeModal}
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      center
    >
      <form onSubmit={handleSubmit}>
        <div className="w-full h-46 mt-2">
          <div className="px-2 mb-2">
            <h1 className="text-xl font-medium">Edit Account</h1>
          </div>
          <div className="px-2 mb-3">
            <Input
              label="Username"
              name="username"
              value={form.username}
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
              value={form.password}
              error={errors?.password}
            />
          </div>
          <div className="px-2 mb-3">
            <label className={InputClasses.LabelClasslist}>Description</label>
            <textarea
              value={form.description}
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
