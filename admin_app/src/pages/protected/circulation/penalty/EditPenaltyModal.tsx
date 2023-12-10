import ClientSearchBox from "@components/ClientSearchBox";
import { CustomInput } from "@components/ui/form/Input";

import { Account, Item, ModalProps, Penalty } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { MdRemoveCircleOutline } from "react-icons/md";
import { toast } from "react-toastify";
import { EditPenaltyValidation } from "./schema";
import { useSwitch } from "@hooks/useToggle";
import ItemSearchBox from "@components/ItemSearchBox";

interface EditPenaltyModalProps extends ModalProps {
  penalty: Penalty;
}
const EditPenaltyModal = (props: EditPenaltyModalProps) => {
  const { Put } = useRequest();
  const {
    form,
    handleFormInput,
    errors,
    validate,
    setForm,
    resetForm,
    removeFieldError,
  } = useForm<{
    id: string;
    accountId: string;
    description: string;
    amount: number;
    item: string;
  }>({
    initialFormData: {
      id: "",
      accountId: "",
      item: "",
      description: "",
      amount: 0,
    },
    schema: EditPenaltyValidation,
  });

  useEffect(() => {
    if (props.isOpen) {
      itemInput.open();
      setForm({
        id: props.penalty.id ?? "",
        item: props.penalty.item,
        accountId: props.penalty.accountId,
        description: props.penalty.description,
        amount: props.penalty.amount,
      });
      setSelectedAccount(props.penalty.account);
    }
  }, [props.isOpen]);
  const queryClient = useQueryClient();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>();
  const onSubmit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    const body = await validate();
    if (body) {
      updatePenalty.mutate(body);
    }
  };

  const updatePenalty = useMutation({
    mutationFn: (body: {
      id: string;
      accountId: string;
      description: string;
      amount: number;
    }) => Put(`/penalties/${body.id}`, body, {}),
    onSuccess: () => {
      toast.success("Penalty has been updated.");
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

  return (
    <Modal show={props.isOpen} onClose={props.closeModal} dismissible>
      <Modal.Header>Edit Penalty</Modal.Header>
      <Modal.Body>
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
                <div className="h-2 flex items-center">
                  <small className="text-red-500 ml-1 py-2">
                    {errors?.item}
                  </small>
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

            <div className="mt-2">
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
                  ? "w-full resize-none h-52 mt-1 focus:outline-none border p-3 border-red-500"
                  : "w-full resize-none h-52 mt-1 focus:outline-none border p-3 "
              }
            ></Textarea>
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
            ></CustomInput>
          </div>
          <div className="flex gap-1 mt-5">
            <Button
              color="primary"
              type="submit"
              isProcessing={updatePenalty.isLoading}
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

export default EditPenaltyModal;
