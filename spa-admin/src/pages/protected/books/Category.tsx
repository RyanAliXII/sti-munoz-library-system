import React, { BaseSyntheticEvent } from "react";
import {
  PrimaryButton,
  SecondaryButton,
  LighButton,
  Input,
  DangerButton,
} from "../../../components/forms/Forms";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { useSwitch } from "../../../hooks/useToggle";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { useForm } from "../../../hooks/useForm";
import { CategorySchema } from "./schema";
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  BodyRow,
  HeadingRow,
} from "../../../components/table/Table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosClient from "../../../definitions/configs/axios";
import { toast } from "react-toastify";
import LoadingBoundary from "../../../components/loader/LoadingBoundary";

const Category = () => {
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

  type Category = {
    name: string;
  };
  const fetchCategories = async () => {
    try {
      const { data: response } = await axiosClient.get("/categories/");
      return response.data?.categories ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const {
    data: categories,
    isLoading,
    isError,
  } = useQuery<Category[]>({
    queryFn: fetchCategories,
    queryKey: ["categories"],
  });
  return (
    <>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">Category</h1>
        </div>
        <div className="mb-4">
          <PrimaryButton
            buttonText="Add Category"
            props={{ onClick: openAddModal }}
          ></PrimaryButton>
        </div>

        <LoadingBoundary isLoading={isLoading} isError={isError}>
          <div className="w-full">
            <Table>
              <Thead>
                <HeadingRow>
                  <Th>Category</Th>
                  <Th></Th>
                </HeadingRow>
              </Thead>
              <Tbody>
                {categories?.map((category) => {
                  return (
                    <BodyRow key={category.name}>
                      <Td className="p-2 capitalize">{category.name}</Td>
                      <Td className="p-2 flex gap-2 items-center">
                        <SecondaryButton
                          props={{
                            className: "flex items-center gap-1 text-sm",
                            onClick: () => {
                              // setSelectedRow({ ...publisher});
                              openEditModal();
                            },
                          }}
                        >
                          <AiOutlineEdit />
                        </SecondaryButton>
                        <DangerButton
                          props={{
                            className:
                              "bg-red-500 flex items-center gap-1 text-sm",
                            onClick: () => {
                              // openConfirmDialog();
                              // setSelectedRow({ ...publisher });
                            },
                          }}
                        >
                          {" "}
                          <AiOutlineDelete />
                        </DangerButton>
                      </Td>
                    </BodyRow>
                  );
                })}
              </Tbody>
            </Table>
          </div>
        </LoadingBoundary>
      </div>
      <AddCategoryModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      <EditCategoryModal isOpen={isEditModalOpen} closeModal={closeEditModal} />
    </>
  );
};

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
}
type Category = {
  name: string;
};
const AddCategoryModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  const FORM_DEFAULT_VALUES: Category = {
    name: "",
  };
  const { form, errors, handleFormInput, validate } = useForm<Category>({
    default: FORM_DEFAULT_VALUES,
    schema: CategorySchema,
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => axiosClient.post("/categories/", form),
    onSuccess: () => {
      toast.success("New category added");
      queryClient.invalidateQueries(["categories"]);
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
            <h1 className="text-xl font-medium">New Category</h1>
          </div>
          <div className="px-2">
            <Input
              labelText="Category name"
              error={errors?.name}
              props={{
                type: "text",
                name: "name",
                value: form.name,
                onChange: handleFormInput,
              }}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Create category</PrimaryButton>
            <LighButton props={{ onClick: closeModal }}>Cancel</LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

const EditCategoryModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
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
            <h1 className="text-xl font-medium">Edit Category</h1>
          </div>
          <div className="px-2">
            <Input
              labelText="Category name"
              props={{ type: "text", name: "category" }}
            />
          </div>
          <div className="flex gap-1 p-2">
            <PrimaryButton>Update category</PrimaryButton>
            <LighButton props={{ onClick: closeModal }}>Cancel</LighButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default Category;
