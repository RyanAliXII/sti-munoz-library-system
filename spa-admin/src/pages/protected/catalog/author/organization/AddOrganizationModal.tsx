import {
  LighButton,
  LightOutlineButton,
  PrimaryButton,
  SecondaryOutlineButton,
} from "@components/ui/button/Button";
import { Input } from "@components/ui/form/Input";
import { ModalProps, Organization } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import React, { BaseSyntheticEvent, FormEventHandler } from "react";
import Modal from "react-responsive-modal";
import { OrganizationValidation } from "../../schema";

const AddOrganizationModal = ({ isOpen, closeModal }: ModalProps) => {
  const { form, errors, handleFormInput, validate } = useForm<
    Omit<Organization, "id">
  >({
    initialFormData: {
      name: "",
    },
    schema: OrganizationValidation,
  });
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      const data = await validate();
      console.log(data);
    } catch {}
  };

  if (!isOpen) return null;
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      center
    >
      <form onSubmit={submit}>
        <div className="w-full h-46 mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">New Organization</h1>
          </div>
          <div className="px-2">
            <Input
              label="Name"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Add organization</PrimaryButton>
            <LighButton type="button" onClick={closeModal}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddOrganizationModal;
