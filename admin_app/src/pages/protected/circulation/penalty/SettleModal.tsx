import { EditModalProps, ModalProps, Penalty } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Uppy from "@uppy/core";
import DashboardComponent from "@uppy/react/src/Dashboard";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".png", ".jpg", ".webp"],
    maxNumberOfFiles: 1,
  },
});

const SettleModal: FC<EditModalProps<Penalty>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const queryClient = useQueryClient();
  const { Patch } = useRequest();
  const { form, handleFormInput, resetForm } = useForm<{
    remarks: string;
  }>({
    initialFormData: {
      remarks: "",
    },
  });
  const updateSettlement = useMutation({
    mutationFn: (form: FormData) =>
      Patch(`/penalties/${formData.id}/settlement`, form),
    onSuccess: () => {
      closeModal();
      toast.success("Penalty has been updated");
      resetForm();
      uppy.cancelAll();
      queryClient.invalidateQueries(["penalties"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later");
    },
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const file = uppy.getFiles()?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("proof", file.data);
    formData.append("remarks", form.remarks);
    updateSettlement.mutate(formData);
  };
  useModalToggleListener(isOpen, () => {
    if (isOpen) return;
    resetForm();
    uppy.cancelAll();
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible>
      <Modal.Header>Settle Penalty</Modal.Header>
      <Modal.Body>
        <form onSubmit={onSubmit}>
          <div className="pb-2">
            <Label>Proof of Payment</Label>
            <DashboardComponent
              width={"100%"}
              hideUploadButton={true}
              uppy={uppy}
              height={"400px"}
            />
          </div>
          <div className="pb-2">
            <Label>Remarks</Label>
            <Textarea
              name="remarks"
              value={form.remarks}
              onChange={handleFormInput}
            />
          </div>
          <Button type="submit" color="primary">
            <div className="flex gap-1 items-center">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default SettleModal;
