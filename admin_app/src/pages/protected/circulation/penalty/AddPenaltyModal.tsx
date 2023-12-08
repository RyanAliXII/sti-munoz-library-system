import ClientSearchBox from "@components/ClientSearchBox";
import { CustomInput } from "@components/ui/form/Input";
import { Account, Item, ModalProps } from "@definitions/types";
import { useForm } from "@hooks/useForm";

import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { BaseSyntheticEvent, useState } from "react";
import { MdRemoveCircleOutline } from "react-icons/md";
import { toast } from "react-toastify";
import { AddPenaltyValidation } from "./schema";
import ItemSearchBox from "@components/ItemSearchBox";
import { useSwitch } from "@hooks/useToggle";

const AddPenaltyModal = (props: ModalProps) => {
  const { Post } = useRequest();
  const {
    form,
    handleFormInput,
    errors,
    validate,
    setForm,
    resetForm,
    removeFieldError,
  } = useForm<{
    accountId: string;
    description: string;
    amount: number;
    item: string;
  }>({
    initialFormData: {
      item: "",
      accountId: "",
      description: "",
      amount: 0,
    },
    schema: AddPenaltyValidation,
  });
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const onSubmit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    const body = await validate();
    if (body) {
      addPenalty.mutate(body);
    }
  };

  const addPenalty = useMutation({
    mutationFn: (body: {
      accountId: string;
      description: string;
      amount: number;
    }) => Post("/penalties/", body, {}),
    onSuccess: () => {
      toast.success("Penalty has been added.");
      queryClient.invalidateQueries(["penalties"]);
    },
    onError: () => {
      toast.error("Unknown error occurred, Please try again later.");
    },
    onSettled: () => {
      setSelectedAccount(null);
      props.closeModal();
      resetForm();
    },
  });
  const itemInput = useSwitch();
  const onSelectItem = (item: Item) => {
    removeFieldError("item");
    setForm((it) => ({ ...it, item: item.name }));
  };
  if (!props.isOpen) return null;
  return (
    <Modal show={props.isOpen} onClose={props.closeModal} dismissible>
      <Modal.Header>New Penalty</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form onSubmit={onSubmit}>
          {selectedAccount === null && (
            <>
              <ClientSearchBox
                setClient={(account) => {
                  setSelectedAccount(account);
                  setForm({
                    ...form,
                    accountId: account.id ?? "",
                  });
                }}
                className="w-full"
              />
              <small className="text-red-500 ml-0.5 ">
                {errors?.accountId}
              </small>
            </>
          )}
          {selectedAccount && (
            <div className="flex w-full p-5 border dark:border-gray-700 rounded gap-3 items-center">
              <div>
                <img
                  className="w-12 rounded-full h-12"
                  src={`https://ui-avatars.com/api/?name=${selectedAccount.givenName}${selectedAccount.surname}&background=2563EB&color=fff`}
                ></img>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-600 dark:text-gray-100">
                  {selectedAccount.displayName}
                </span>
                <small className="text-gray-500 ml-0.5 dark:text-gray-300">
                  {selectedAccount.email}
                </small>
              </div>

              <div className="flex items-center">
                <Tippy content="Unselect account">
                  <button
                    className="p-2 text-red-500"
                    type="button"
                    onClick={() => {
                      setSelectedAccount(null);
                      setForm({
                        ...form,
                        accountId: "",
                      });
                    }}
                  >
                    <MdRemoveCircleOutline className="text-xl" />
                  </button>
                </Tippy>
              </div>
            </div>
          )}

          <div className="mt-1">
            {!itemInput.isOpen && (
              <div>
                <ItemSearchBox
                  label="Select item"
                  setItem={onSelectItem}
                  className={`w-full mb-2`}
                />
                <div className="h-2 flex items-center py-2 mt-1">
                  <small className="text-red-500 ml-1">{errors?.item}</small>
                </div>
              </div>
            )}

            {itemInput.isOpen && (
              <div className="flex-1">
                <CustomInput
                  value={form.item}
                  name="item"
                  onChange={handleFormInput}
                  label="Item"
                  placeholder="Enter Item name"
                  error={errors?.item}
                />
              </div>
            )}

            <div className="mt-1">
              <Button
                color="primary"
                outline
                onClick={() => {
                  itemInput.set(!itemInput.isOpen);
                }}
              >
                {itemInput.isOpen ? "Select Item" : "Enter Item"}
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleFormInput}
              className={
                errors?.description
                  ? "w-full resize-none mt-1 focus:outline-none border p-3 border-red-500"
                  : "w-full resize-none  mt-1 focus:outline-none border p-3 "
              }
            />
            <small className="text-red-500 ml-0.5 ">
              {errors?.description}
            </small>
          </div>
          <div>
            <CustomInput
              value={form.amount}
              error={errors?.amount}
              type="number"
              label="Amount"
              name="amount"
              onChange={handleFormInput}
            />
          </div>
          <div className="flex gap-1 mt-5">
            <Button
              color="primary"
              type="submit"
              isProcessing={addPenalty.isLoading}
            >
              Save
            </Button>
            <Button color="light" onClick={props.closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddPenaltyModal;
