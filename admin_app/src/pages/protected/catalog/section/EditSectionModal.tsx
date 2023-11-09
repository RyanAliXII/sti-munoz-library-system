import { ModalProps } from "@definitions/types";

const EditSectionModal: React.FC<ModalProps> = ({ isOpen, closeModal }) => {
  if (!isOpen) return null; //; temporary fix for react-responsive modal bug
  return (
    <></>
    // <Modal
    //   open={isOpen}
    //   onClose={closeModal}
    //   classNames={{ modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded" }}
    //   center
    // >
    //   <form>
    //     <div className="w-full h-46">
    //       <div className="px-2 mb-3">
    //         <h1 className="text-xl font-medium">Edit Section</h1>
    //       </div>
    //       <div className="px-2">
    //         <Input
    //           label="Section name"
    //           // error={errors?.name}
    //           type="text"
    //           name="name"
    //         />
    //       </div>
    //       <div className="flex gap-1 p-2">
    //         <PrimaryButton>Update section</PrimaryButton>
    //         <LighButton onClick={closeModal}>Cancel</LighButton>
    //       </div>
    //     </div>
    //   </form>
    // </Modal>
  );
};

export default EditSectionModal;
