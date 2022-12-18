import React from 'react';
import {
    PrimaryButton,
    SecondaryButton,
    LighButton,
    Input,
    SECONDARY_BTN_DEFAULT_CLASS,
  } from "../../../components/forms/Forms";
  import { AiOutlineEdit } from "react-icons/ai";
  import { useToggleManual } from "../../../hooks/useToggle";
  import "react-responsive-modal/styles.css";
  import { Modal } from "react-responsive-modal";
  
  const Category = () => {
    const { set: setAddModalState, value: isAddModalOpen } = useToggleManual();
    const { set: setEditModalState, value: isEditModalOpen } = useToggleManual();
  
    const closeAddModal = () => {
      setAddModalState(false);
    };
    const openAddModal = () => {
      setAddModalState(true);
    };
  
    const closeEditModal = () => {
      setEditModalState(false);
    };
    const openEditModal = () => {
      setEditModalState(true);
    };
  
    return (
      <>
        <div className="w-full h-full">
          <div>
            <h1 className="text-3xl font-bold ml-5 lg:ml-9 ">Category</h1>
          </div>
          <div className="mx-auto mt-3 w-11/12 lg:ml-9">
            <PrimaryButton props={{onClick:openAddModal}}> Create Category </PrimaryButton>
          </div>
          <table className="border mx-auto w-11/12 mt-3 lg:ml-9 lg:w-1/2 rounded">
            <thead>
              <tr className="border">
                <th className="p-2">Category name</th>
                <th className="p-2">Date Created </th>
                <th className="p-2">Updated at</th>  
              </tr>
            </thead>
            <tbody>
              <tr className="border">
                <td className="p-2 text-center">Thesis</td>
                <td className="p-2 text-center"></td>
                <td className="p-2 text-center"></td>
                <td className="p-2 text-center">
                  <SecondaryButton
                    props={{
                      className: `${SECONDARY_BTN_DEFAULT_CLASS} flex items-center gap-1 text-sm`,
                      onClick: openEditModal,
                    }}
                  >
                    <AiOutlineEdit /> Edit
                  </SecondaryButton>
                </td>
              </tr>
              <tr className="border">
                <td className="p-2 text-center">References</td>
                <td className="p-2 text-center"></td>
                <td className="p-2 text-center"></td>
                <td className="p-2 text-center">
                  <SecondaryButton
                    props={{
                      className: `${SECONDARY_BTN_DEFAULT_CLASS} flex items-center gap-1 text-sm`,
                      onClick: openEditModal,
                    }}
                  >
                    <AiOutlineEdit /> Edit
                  </SecondaryButton>
                </td>
              </tr>
            </tbody>
          </table>
         
        </div>
        <EditAuthorModal isOpen={isEditModalOpen} closeModal={closeEditModal} />
        <AddAuthorModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      </>
    );
  };
  
  interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
  }
  
  const AddAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
     if(!isOpen) return null //; temporary fix for react-responsive modal bug

    return (
      <Modal
        open={isOpen}
        onClose={closeModal}
        classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
        center
      >
      <form>
        <div className="w-full h-28 mt-2">
          <div className="px-2">
            <Input
              labelText="Category name"
              props={{ type: "text", name: "givenName" }}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Create category</PrimaryButton>
            <LighButton props={{ onClick: closeModal }}>
              Cancel
            </LighButton>
          </div>
        </div>
        </form>
      </Modal>
    );
  };

  const EditAuthorModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
   if(!isOpen) return null //; temporary fix for react-responsive modal bug
    return (
      <Modal
        open={isOpen}
        onClose={closeModal}
        classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
        center
      >
      <form>
        <div className="w-full h-28 mt-2">
          <div className="px-2">
            <Input
              labelText="Category name"
              props={{ type: "text", name: "category" }}
            />
          </div>
          <div className="flex gap-1 mt-2 p-2">
            <PrimaryButton>Update category</PrimaryButton>
            <LighButton props={{ onClick: closeModal }}>
              Cancel
            </LighButton>
          </div>
        </div>
        </form>
      </Modal>
    );
  };
  
  export default Category;
  
