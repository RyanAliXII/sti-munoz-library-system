import { DangerButton, PrimaryButton } from "@components/ui/button/Button";
import { ModalProps } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Uppy from "@uppy/core";
import DashboardComponent from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { FormEvent } from "react";
import { useBookEditFormContext } from "../BookEditFormContext";
import { useSwitch } from "@hooks/useToggle";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";

const eBookUppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".pdf"],
    maxNumberOfFiles: 1,
  },
}).use(XHRUpload, {
  fieldName: "ebook",
  endpoint: "",
});
const UploadEbook = () => {
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
  };
  const { form: book } = useBookEditFormContext();
  const { Delete } = useRequest();
  const queryClient = useQueryClient();
  const removeEbook = useMutation({
    mutationFn: () => Delete(`/books/${book.id}/ebooks`),
    onSuccess: () => {
      queryClient.invalidateQueries(["book"]);
    },
  });

  const {
    close: closeRemoveDialog,
    isOpen: isOpenRemoveDialog,
    open: openRemoveDialog,
  } = useSwitch();

  return (
    <div>
      <h2 className="text-2xl mb-1">Upload eBook</h2>
      <hr></hr>
      <form onSubmit={onSubmit}>
        <DashboardComponent
          className="mt-5"
          width={"100%"}
          hideUploadButton={true}
          uppy={eBookUppy}
          height={"200px"}
        />
        <div className="mt-1">
          <PrimaryButton className="mt-2">Save</PrimaryButton>
          <DangerButton
            type="button"
            className="ml-2"
            disabled={book.ebook.length === 0}
            onClick={openRemoveDialog}
          >
            Remove eBook
          </DangerButton>
        </div>
      </form>
      <DangerConfirmDialog
        title="Remove ebook!"
        text="Are you sure you want to remove the ebook? This will delete the eBook permamanently."
        close={closeRemoveDialog}
        isOpen={isOpenRemoveDialog}
        onConfirm={() => {
          removeEbook.mutate();
        }}
      />
    </div>
  );
};

export default UploadEbook;
