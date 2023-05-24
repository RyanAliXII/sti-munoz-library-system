import LoadingBoundary from "@components/loader/LoadingBoundary";
import { apiScope } from "@definitions/configs/msal/scopes";
import { Book, DetailedAccession, ModalProps } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import Modal from "react-responsive-modal";

interface BookCopySelectionProps extends ModalProps {
  book: Book;
  onSelectCopy: (accession: DetailedAccession) => void;
  bagItemIds: string[];
}
const BookCopySelectionModal: React.FC<BookCopySelectionProps> = ({
  book,
  isOpen,
  closeModal,
  onSelectCopy,
  bagItemIds,
}) => {
  const [selectedAccession, setSelectedAccession] =
    useState<DetailedAccession | null>(null);

  const { Get } = useRequest();
  const fetchAccessionById = async () => {
    try {
      const { data: response } = await Get(`/books/${book.id}/accessions`, {}, [
        apiScope("Accession.Read"),
      ]);
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
    if (isOpen) {
      refetch();
    } else {
      setSelectedAccession(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;
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
        <div className="overflow-x-auto mb-3">
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
                const isItemAlreadyAdded = bagItemIds.includes(
                  accession.id ?? ""
                );
                const isAvailable = accession.isAvailable;
                const trClass =
                  isItemAlreadyAdded || !isAvailable
                    ? "cursor-pointer pointer-events-none hover disabled active"
                    : " cursor-pointer hover";
                const statusTdClass =
                  isItemAlreadyAdded || !isAvailable
                    ? "text-gray-500"
                    : "text-success ";
                return (
                  <tr
                    key={accession.id}
                    className={trClass}
                    onClick={() => {
                      if (selectedAccession?.id === accession.id) {
                        setSelectedAccession(null);
                        return;
                      }
                      setSelectedAccession(accession);
                    }}
                  >
                    <td>
                      <input
                        readOnly={true}
                        className="h-4 w-4"
                        type="checkbox"
                        disabled={isItemAlreadyAdded || !isAvailable}
                        checked={selectedAccession?.id === accession.id}
                      />
                    </td>
                    <td>{accession.number}</td>
                    <td>{accession.copyNumber}</td>
                    <td className={statusTdClass}>
                      {isItemAlreadyAdded || !isAvailable
                        ? "Unavailable"
                        : "Available"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          className="btn btn-primary"
          disabled={selectedAccession === null}
          onClick={() => {
            if (selectedAccession) {
              onSelectCopy(selectedAccession);
            }
          }}
        >
          Proceed
        </button>
        <button
          className="ml-1 btn btn-ghost"
          onClick={() => {
            closeModal();
          }}
        >
          Cancel
        </button>
      </LoadingBoundary>
    </Modal>
  );
};

export default BookCopySelectionModal;
