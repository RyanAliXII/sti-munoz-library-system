import {
  LighButton,
  LightOutlineButton,
  PrimaryButton,
  SecondaryOutlineButton,
} from "@components/ui/button/Button";
import { Input } from "@components/ui/form/Input";
import { ModalProps, Organization } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import React, { BaseSyntheticEvent, FormEventHandler, useEffect } from "react";
import Modal from "react-responsive-modal";
import { OrganizationValidation } from "../../schema";
import { useMutation } from "@tanstack/react-query";

import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import { useRequest } from "@hooks/useRequest";
import { apiScope } from "@definitions/configs/msal/scopes";

interface EditOrgModalProps extends ModalProps {
  refetch: () => void;
  formData: Organization;
}
const EditOrganizationModal = ({
  isOpen,
  closeModal,
  refetch,
  formData,
}: EditOrgModalProps) => {
  const { form, errors, handleFormInput, validate, resetForm, setForm } =
    useForm<Organization>({
      initialFormData: {
        name: "",
      },
      schema: OrganizationValidation,
    });
  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);

  const { Put } = useRequest();
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      const data = await validate();
      if (!data) return;
      updateOrganization.mutate(data);
    } catch {}
  };
  const updateOrganization = useMutation({
    mutationFn: (data: Organization) =>
      Put(`/authors/organizations/${data.id}`, data, {}, [
        apiScope("Author.Edit"),
      ]),
    onSuccess: () => {
      toast.success("Organization has been updated.");
      refetch();
    },
    onError: () => {
      toast.error(ErrorMsg.New);
    },
    onSettled: () => {
      resetForm();
      closeModal();
    },
  });

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
            <h1 className="text-xl font-medium">Edit Organization</h1>
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
            <PrimaryButton>Update organization</PrimaryButton>
            <LighButton type="button" onClick={closeModal}>
              Cancel
            </LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditOrganizationModal;