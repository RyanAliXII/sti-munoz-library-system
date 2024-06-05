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
import { useMsal } from "@azure/msal-react";
import { apiScope } from "@definitions/configs/msal/scopes";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { toast } from "react-toastify";
import { Button } from "flowbite-react";
import Compressor from "@uppy/compressor";

const eBookUppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".pdf"],
    maxNumberOfFiles: 1,
  },
})
  .use(Compressor)
  .use(XHRUpload, {
    fieldName: "ebook",
    method: "PUT",
    endpoint: "",
  });
const UploadEbook = ({ refetch = () => {}, eBookUrl = "" }) => {
  const { instance } = useMsal();
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const hasFiles = eBookUppy.getFiles().length > 0;
    if (!hasFiles) return;
    const response = await instance.acquireTokenSilent({
      scopes: [apiScope("LibraryServer.Access")],
    });

    eBookUppy.getPlugin("XHRUpload")?.setOptions({
      headers: {
        Authorization: `Bearer ${response.accessToken}`,
      },
      endpoint: `${BASE_URL_V1}/books/${book.id}/ebooks`,
    });
    eBookUppy
      .upload()
      .then(() => {
        toast.success("eBook uploaded.");
        refetch();
      })
      .catch(() => {
        toast.error("Unknown error occured.");
      })
      .finally(() => {
        eBookUppy.cancelAll();
      });
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
          height={"400px"}
        />
        <div className="mt-3 flex">
          <Button color="primary" type="submit">
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
