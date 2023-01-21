import React, { BaseSyntheticEvent } from "react";
import { PrimaryButton, LighButton, Input } from "@components/forms/Forms";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { useSwitch } from "@hooks/useToggle";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useForm } from "@hooks/useForm";
import { SectionSchema } from "./schema";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  BodyRow,
  HeadingRow,
} from "@components/table/Table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@definitions/configs/axios";
import { toast } from "react-toastify";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import { Section } from "@definitions/types";
const SectionPage = () => {
  const {
    isOpen: isAddModalOpen,
    open: openAddModal,
    close: closeAddModal,
  } = useSwitch();

  const {
    isOpen: isEditModalOpen,
    open: openEditModal,
    close: closeEditModal,
  } = useSwitch();

  const fetchSections = async () => {
    try {
      const { data: response } = await axiosClient.get("/sections/");
      return response.data?.sections ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const {
    data: sections,
    isLoading,
    isError,
  } = useQuery<Section[]>({
    queryFn: fetchSections,
    queryKey: ["sections"],
  });
  return (
    <>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Sections</h1>
        </div>
        <div className="mb-4">
          <PrimaryButton onClick={openAddModal}>New Section</PrimaryButton>
        </div>

        <LoadingBoundary isLoading={isLoading} isError={isError}>
          <div className="w-full">
            <Table>
              <Thead>
                <HeadingRow>
                  <Th>Section</Th>
                  <Th>Different Accession</Th>
                  <Th></Th>
                </HeadingRow>
              </Thead>
              <Tbody>
                {sections?.map((section) => {
                  return (
                    <BodyRow key={section.name}>
                      <Td className="p-2 capitalize">{section.name}</Td>
                      <Td>
                        {section.hasOwnAccession ? (
                          <span className="text-green-500"> Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </Td>
                      <Td className="p-2 flex gap-2 items-center">
                        <AiOutlineEdit
                          className="cursor-pointer text-yellow-400 text-xl"
                          onClick={openEditModal}
                        />
                        <AiOutlineDelete className="cursor-pointer text-orange-600  text-xl" />
                      </Td>
                    </BodyRow>
                  );
                })}
              </Tbody>
            </Table>
          </div>
        </LoadingBoundary>
      </div>
      <AddSectionModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      <EditSectionModal isOpen={isEditModalOpen} closeModal={closeEditModal} />
    </>
  );
};

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

const AddSectionModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const FORM_DEFAULT_VALUES: Section = {
    name: "",
    hasOwnAccession: false,
  };
  const { form, errors, handleFormInput, validate } = useForm<Section>({
    initialFormData: FORM_DEFAULT_VALUES,
    schema: SectionSchema,
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => axiosClient.post("/sections/", form),
    onSuccess: () => {
      toast.success("New section added");
      queryClient.invalidateQueries(["sections"]);
    },
    onError: (error) => {
      console.error(error);
    },
    onSettled: () => {
      closeModal();
    },
  });
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      await validate();
      mutation.mutate();
    } catch {}
  };

  if (!isOpen) return null; //; temporary fix for react-responsive modal bug

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
            <h1 className="text-xl font-medium">New Section</h1>
          </div>
          <div className="px-2">
            <Input
              label="Section name"
              error={errors?.name}
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormInput}
            />
          </div>
          <div className="px-2">
            <Input
              className="h-5 w-5"
              label="Different Accession"
              error={errors?.hasOwnAccession}
              type="checkbox"
              name="hasOwnAccession"
              checked={form.hasOwnAccession}
              onChange={handleFormInput}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Add section</PrimaryButton>
            <LighButton onClick={closeModal}>Cancel</LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

const EditSectionModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  if (!isOpen) return null; //; temporary fix for react-responsive modal bug
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
      center
    >
      <form>
        <div className="w-full h-46">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-medium">Edit Section</h1>
          </div>
          <div className="px-2">
            <Input
              label="Section name"
              // error={errors?.name}
              type="text"
              name="name"
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Update section</PrimaryButton>
            <LighButton onClick={closeModal}>Cancel</LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SectionPage;
