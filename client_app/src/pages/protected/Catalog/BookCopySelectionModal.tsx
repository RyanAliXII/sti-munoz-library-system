import LoadingBoundary from "@components/loader/LoadingBoundary";
import { Book, DetailedAccession, ModalProps } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import Modal from "react-responsive-modal";

interface BookCopySelectionProps extends ModalProps {
  book: Book;
}
const BookCopySelectionModal: React.FC<BookCopySelectionProps> = ({
  book,
  isOpen,
  closeModal,
}) => {
  const { Get } = useRequest();
  const fetchAccessionById = async () => {
    try {
      const { data: response } = await Get(`/books/${book.id}/accessions`);
      return response?.data?.accessions ?? [];
    } catch {
      return [];
    }
  };

  const {
    data: accessions,
    refetch,
    isError,
    isFetching,
  } = useQuery<DetailedAccession[]>({
    queryFn: fetchAccessionById,
    queryKey: ["bookAccessions"],
    initialData: [],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    console.log("open");
    if (isOpen) {
      refetch();
    }
  }, [isOpen]);
  return (
    <Modal
      center
      onClose={closeModal}
      open={isOpen}
      showCloseIcon={false}
      classNames={{
        modal: "w-11/12 md:w-7/12 lg:w-9/12 rounded",
      }}
    >
      <LoadingBoundary isLoading={isFetching} isError={isError}>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th></th>
                <th>Accession Number</th>
                <th>Copy Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {accessions.map((accession) => {
                return (
                  <tr key={accession.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td>{accession.number}</td>
                    <td>{accession.copyNumber}</td>
                    <td>{}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button className="btn btn-primary">Done</button>
      </LoadingBoundary>
    </Modal>
  );
};

export default BookCopySelectionModal;
