import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useMutation } from "@tanstack/react-query";
import Compressor from "@uppy/compressor";
import Uppy from "@uppy/core";
import DashboardComponent from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { Button } from "flowbite-react";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { useBookEditFormContext } from "../BookEditFormContext";

const eBookUppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".pdf"],
    maxNumberOfFiles: 1,
  },
})
  .use(Compressor)
  .use(XHRUpload, {
    method: "PUT",
    endpoint: "",
  });
const UploadEbook = ({ refetch = () => {}, eBookUrl = "" }) => {
  const { Get, Put } = useRequest();
  const [isUploading, setIsUploading] = useState(false);
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const hasFiles = eBookUppy.getFiles().length > 0;
    if (!hasFiles) return;

    const uploadRequestResponse = await Get("/books/ebooks/upload-requests");
    const { data } = uploadRequestResponse.data;
    const url = data?.url;
    const key = data?.key;
    if (!url || !key) return;
    eBookUppy.getPlugin("XHRUpload")?.setOptions({
      headers: {
        "Content-Type": "application/pdf",
      },
      endpoint: url,
    });
    setIsUploading(true);
    try {
      await eBookUppy.upload();
      await Put(`/books/${book.id}/ebooks`, {
        key,
      });
      refetch();
      toast.success("eBook uploaded.");
    } catch (error) {
      toast.error("Unknown error occured");
      console.error(error);
    } finally {
      eBookUppy.cancelAll();
      setIsUploading(false);
    }
  };
  const { form: book } = useBookEditFormContext();
  const { Delete } = useRequest();
  const removeEbook = useMutation({
    mutationFn: () => Delete(`/books/${book.id}/ebooks`),
    onSuccess: () => {
      toast.success("eBook removed.");
      refetch();
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
    onSettled: () => {
      closeRemoveDialog();
    },
  });

  const {
    close: closeRemoveDialog,
    isOpen: isOpenRemoveDialog,
    open: openRemoveDialog,
  } = useSwitch();

  return (
    <div>
      <h2 className="dark:text-white text-2xl">Upload eBook</h2>

      <form onSubmit={onSubmit}>
        <DashboardComponent
          className="mt-5"
          width={"100%"}
          hideUploadButton={true}
          uppy={eBookUppy}
          showProgressDetails={true}
          height={"400px"}
        />
        <div className="mt-3 flex">
          <Button
            color="primary"
            type="submit"
            isProcessing={isUploading}
            disabled={isUploading}
          >
            Save
          </Button>
          <Button
            color="failure"
            type="button"
            className="ml-2"
            disabled={eBookUrl.length === 0}
            onClick={openRemoveDialog}
          >
            Remove eBook
          </Button>
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
