import { useRequest } from "@hooks/useRequest";
import { useBookEditFormContext } from "../BookEditFormContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import "react-pdf/dist/esm/Page/TextLayer.css";
import {
  DangerButton,
  LightOutlineButton,
  PrimaryButton,
} from "@components/ui/button/Button";
import { Input, InputClasses } from "@components/ui/form/Input";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { useSwitch } from "@hooks/useToggle";
import DocumentView from "./DocumentView";

const EbookPanel = () => {
  const { form: book } = useBookEditFormContext();
  const { Get, Delete } = useRequest();
  const fetchEbook = async () => {
    try {
      const response = await Get(`/books/${book.id}/ebooks`, {
        responseType: "arraybuffer",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      console.error(error);
      return "";
    }
  };
  const queryClient = useQueryClient();
  const removeEbook = useMutation({
    mutationFn: () => Delete(`/books/${book.id}/ebooks`),
    onSuccess: () => {
      queryClient.invalidateQueries(["book"]);
    },
  });
  const { data: eBookUrl } = useQuery({
    queryFn: fetchEbook,
    queryKey: ["eBook"],
    enabled: book.ebook.length > 1,
  });
  const {
    close: closeRemoveDialog,
    isOpen: isOpenRemoveDialog,
    open: openRemoveDialog,
  } = useSwitch();
  return (
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10 ">
      <div className="w-full flex justify-between mb-5">
        <h1 className="text-2xl">eBook</h1>
      </div>
      <div className="flex gap-2">
        <DangerButton
          disabled={book.ebook.length === 0}
          onClick={openRemoveDialog}
        >
          Remove eBook
        </DangerButton>
        <PrimaryButton>Update eBook</PrimaryButton>
      </div>
      <hr className="mb-3 mt-3"></hr>
      <DocumentView eBookUrl={eBookUrl} />
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

export default EbookPanel;
