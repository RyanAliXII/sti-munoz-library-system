import { EditModalProps, Penalty } from "@definitions/types";
import { useForm } from "@hooks/useForm";
import useModalToggleListener from "@hooks/useModalToggleListener";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Compressor from "@uppy/compressor";
import Uppy from "@uppy/core";
import DashboardComponent from "@uppy/react/src/Dashboard";
import { Button, Label, Modal, Textarea } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".png", ".jpg", ".webp", ".jpeg"],
    maxNumberOfFiles: 1,
  },
}).use(Compressor);

const EditSettlementModal: FC<EditModalProps<Penalty>> = ({
  isOpen,
  closeModal,
  formData,
}) => {
  const queryClient = useQueryClient();
  const { Patch, Get } = useRequest();
  const { form, handleFormInput, resetForm, setForm } = useForm<{
    remarks: string;
  }>({
    initialFormData: {
      remarks: "",
    },
  });
  const updateSettlement = useMutation({
    mutationFn: (form: FormData) =>
      Patch(`/penalties/${formData.id}/settlement`, form, {
        params: {
          isUpdate: true,
        },
      }),
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
  useModalToggleListener(isOpen, async () => {
    if (!isOpen) {
      uppy.cancelAll();
      return;
    }
    setForm({ remarks: formData.remarks ?? "" });
    // const url = buildS3Url(formData.proof ?? "");
    try {
      const response = await Get(`/penalties/${formData.id}/proofs`);
      const { data } = response.data;
      const url = data?.url;
      if (!url) return;
      const fileResponse = await fetch(url);
      const blob = await fileResponse.blob();
      console.log(blob);
      uppy.addFile({
        name: blob.name,
        type: blob.type,
        data: blob,
      });
    } catch (err) {
      console.error(err);
    }
  });
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible>
      <Modal.Header>Edit Penalty Settlement</Modal.Header>
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

export default EditSettlementModal;
