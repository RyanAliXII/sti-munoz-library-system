import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { LighButton } from "@components/ui/button/Button";
import { HOST } from "@definitions/configs/api.config";
import { Book, ModalProps } from "@definitions/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";
import Modal from "react-responsive-modal";

interface PrintablesModalProps extends ModalProps {
  book: Book;
}

export const BookPrintablesModal: React.FC<PrintablesModalProps> = ({
  closeModal,
  isOpen,
  book,
}) => {
  const printableDiv = useRef<HTMLDivElement | null>(null);

  const fetchPDF = async () => {
    const response = await axios.get(`${HOST}/printables/books/${book.id}`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    return url;
  };
  const {
    data: pdfURL,
    isFetching,
    isError,
  } = useQuery<string>({
    queryFn: fetchPDF,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: "",
    queryKey: ["bookPrintable", book],
  });

  if (!isOpen) return null;
  return (
    <Modal
      showCloseIcon={false}
      open={isOpen}
      onClose={closeModal}
      styles={{
        modal: {
          maxWidth: "none",
        },
      }}
      classNames={{
        modal: "w-11/12  lg:w-12/12  xl: rounded h-[900-px]",
      }}
    >
      <div className="py-2 mx-auto" ref={printableDiv}>
        <LoadingBoundaryV2 isLoading={isFetching} isError={isError}>
          <div className="mb-5">
            <LighButton onClick={closeModal}>Close</LighButton>
          </div>
          <iframe
            className="w-full h-[900-px]"
            src={pdfURL}
            height="900px"
          ></iframe>
        </LoadingBoundaryV2>
        <div className="flex flex-col w-full gap-2 mb-2 "></div>
      </div>
    </Modal>
  );
};
