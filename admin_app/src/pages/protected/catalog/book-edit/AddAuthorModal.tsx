import { ModalProps, PersonAuthor } from "@definitions/types";
import React, { BaseSyntheticEvent, useState } from "react";
import { CreateAuthorSchema, OrganizationValidation } from "../schema";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import Modal from "react-responsive-modal";
import { Input } from "@components/ui/form/Input";
import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import { useBookEditFormContext } from "./BookEditFormContext";

export const ADD_AUTHOR_INITIAL_FORM: Omit<PersonAuthor, "id"> = {
  givenName: "",
  middleName: "",
  surname: "",
};

const AddAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"Person" | "Org">("Person");
  const activeTabClass =
    "basis-1/2 border-blue-500 flex justify-center rounded text-blue-500 rounded p-2";
  const nonActiveClass = "flex justify-center basis-1/2 p-2 text-gray-400";
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      styles={{ modal: { maxWidth: "500px" } }}
      classNames={{ modal: "w-11/12 md:w-9/12 lg:w-6/12 rounded" }}
      showCloseIcon={false}
      center
    >
      <div className="w-full flex rounded border mb-5">
        <div
          className={activeTab === "Person" ? activeTabClass : nonActiveClass}
          role="button"
          onClick={() => {
            setActiveTab("Person");
          }}
        >
          <span> Person as Author</span>
        </div>
        <div
          className={activeTab === "Org" ? activeTabClass : nonActiveClass}
          role="button"
          onClick={() => {
            setActiveTab("Org");
          }}
        >
          Organization as Author
        </div>
      </div>
      <div>
        {activeTab === "Person" ? (
          <PersonForm closeModal={closeModal} />
        ) : (
          <OrganizationForm closeModal={closeModal} />
        )}
      </div>
    </Modal>
  );
};

const PersonForm = ({ closeModal }: { closeModal: () => void }) => {
  const { form, errors, validate, handleFormInput, resetForm } = useForm<
    Omit<PersonAuthor, "id">
  >({
    initialFormData: ADD_AUTHOR_INITIAL_FORM,
    schema: CreateAuthorSchema,
  });
  const queryClient = useQueryClient();
  const { setForm: setBookEditForm } = useBookEditFormContext();
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      await validate();
      mutation.mutate();
    } catch (error) {
      console.error(error);
    }
  };
  const { Post } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Post("/authors/", form),
    onSuccess: (response) => {
      toast.success("New author has been added.");
      queryClient.invalidateQueries(["authors"]);
      const { data } = response.data;
      if (data?.author?.id) {
        setBookEditForm((prev) => ({
          ...prev,
          authors: [...prev.authors],
        }));
      }
    },
    onError: (error) => {
      toast.error(ErrorMsg.New);
      console.error(error);
    },
    onSettled: () => {
      closeModal();
      resetForm();
    },
  });
  return (
    <form onSubmit={submit}>
      <div className="w-full h-80">
        <div className="px-2 mb-2">
          <Input
            label="Given name"
            error={errors?.givenName}
            type="text"
            name="givenName"
            onChange={handleFormInput}
            value={form.givenName}
          />
        </div>
        <div className="px-2 mb-2">
          <Input
            label="Middle name/initial"
            error={errors?.middleName}
            type="text"
            name="middleName"
            onChange={handleFormInput}
            value={form.middleName}
          />
        </div>
        <div className="px-2 mb-2">
          <Input
            label="Surname"
            error={errors?.surname}
            type="text"
            name="surname"
            onChange={handleFormInput}
            value={form.surname}
          />
        </div>
        <div className="flex gap-1 p-2">
          <PrimaryButton>Add author</PrimaryButton>
          <LighButton type="button" onClick={closeModal}>
            Cancel
          </LighButton>
        </div>
      </div>
    </form>
  );
};

const OrganizationForm = ({ closeModal }: { closeModal: () => void }) => {
  const queryClient = useQueryClient();
  const { form, errors, handleFormInput, validate, resetForm } = useForm({
    initialFormData: {
      name: "",
    },
    schema: OrganizationValidation,
  });

  const { Post } = useRequest();
  const { setForm: setBookEditForm } = useBookEditFormContext();
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      const data = await validate();
      if (!data) return;
      newOrganization.mutate(data);
    } catch {}
  };
  const newOrganization = useMutation({
    mutationFn: (data: { name: string }) =>
      Post("/authors/organizations", data),
    onSuccess: (response) => {
      toast.success("New organization has been added.");
      queryClient.invalidateQueries(["authors"]);
      const { data } = response.data;
      if (data?.organization?.id) {
        setBookEditForm((prev) => ({
          ...prev,
          authors: [...prev.authors],
        }));
      }
    },
    onError: () => {
      toast.error(ErrorMsg.New);
    },
    onSettled: () => {
      resetForm();
      closeModal();
    },
  });

  return (
    <form onSubmit={submit}>
      <div className="w-full h-36 mt-2">
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
  );
};

export default AddAuthorModal;
