import React, { BaseSyntheticEvent } from "react";
import { PrimaryButton, LighButton } from "@components/ui/button/Button";
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
} from "@components/ui/table/Table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { toast } from "react-toastify";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import { Section } from "@definitions/types";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { Input } from "@components/ui/form/Input";
import { useRequest } from "@hooks/useRequest";
import { apiScope } from "@definitions/configs/msal/scopes";
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
  const { Get } = useRequest();
  const fetchSections = async () => {
    try {
      const { data: response } = await Get("/sections/", {}, [
        apiScope("Section.Read"),
      ]);
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
      <ContainerNoBackground className="flex gap-2">
        <div className="w-full flex justify-between">
          <h1 className="text-3xl font-bold text-gray-700">Sections</h1>
          <PrimaryButton onClick={openAddModal}>New Section</PrimaryButton>
        </div>
      </ContainerNoBackground>
      <LoadingBoundary isLoading={isLoading} isError={isError}>
        <Container>
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
        </Container>
      </LoadingBoundary>
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
  const { Post } = useRequest();
  const mutation = useMutation({
    mutationFn: () => Post("/sections/", form, {}, [apiScope("Section.Add")]),
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
          <div className="flex items-center  gap-2">
            <input
              type="checkbox"
              className="w-5 h-5 ml-2"
              name="hasOwnAccession"
              checked={form.hasOwnAccession}
              onChange={handleFormInput}
            ></input>
            <label className="text-sm text-gray-500">
              Separate Generated Accession Number
            </label>
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
