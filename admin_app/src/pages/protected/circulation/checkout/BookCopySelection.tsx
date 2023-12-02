import {
  Accession,
  Book,
  DetailedAccession,
  ModalProps,
} from "@definitions/types";
import { useEffect, useMemo, useState } from "react";

import { BorrowedEbook, CheckoutAccession, CheckoutForm } from "./CheckoutPage";

import LoadingBoundary from "@components/loader/LoadingBoundary";
import { useRequest } from "@hooks/useRequest";
import { BorrowStatuses } from "@internal/borrow-status";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button, Checkbox, Modal, Table } from "flowbite-react";

interface BookCopySelectionProps extends ModalProps {
  book: Book;
  updateAccessionsToBorrow: (accesions: CheckoutAccession[]) => void;
  updateEbooksToBorrow: (ebooks: BorrowedEbook[]) => void;
  form: CheckoutForm;
}
const BookCopySelectionModal = ({
  closeModal,
  isOpen,
  book,
  updateAccessionsToBorrow,
  updateEbooksToBorrow,
  form,
}: BookCopySelectionProps) => {
  const [selectedAccessions, setSelectedAccessions] = useState<
    CheckoutAccession[]
  >([]);
  const [selectedEbooks, setSelectedEbooks] = useState<BorrowedEbook[]>([]);
  const { Get } = useRequest();
  const fetchAccessionById = async () => {
    try {
      const { data: response } = await Get(`/books/${book.id}/accessions`, {});
      return response?.data?.accessions ?? [];
    } catch {
      return [];
    }
  };

  const getDate5DaysFromNow = (): Date => {
    let date = new Date();
    date.setDate(date.getDate() + 5);
    return date;
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

  const queryClient = useQueryClient();
  useEffect(() => {
    if (isOpen) {
      setSelectedAccessions([...form.accessions]);
      setSelectedEbooks([...form.ebooks]);
      refetch();
    } else {
      setSelectedAccessions([]);
      setSelectedEbooks([]);
      queryClient.setQueryData(["bookAccessions"], []); //clear data
    }
  }, [isOpen]);

  const removeCopy = (bookId: string | undefined, accessionNumber: number) => {
    if (!bookId) return;
    setSelectedAccessions((prevSelected) =>
      prevSelected.filter(
        (a) => a.bookId === book.id && a.number != accessionNumber
      )
    );
  };
  const removeEbook = (bookId: string) => {
    setSelectedEbooks((prevSelected) =>
      prevSelected.filter((b) => b.bookId != bookId)
    );
  };
  const handleRowClickOnEbook = (book: Book) => {
    if (!selectedEbookCache.hasOwnProperty(book.id ?? "")) {
      setSelectedEbooks((prevSelected) => [
        ...prevSelected,
        {
          bookId: book.id ?? "",
          dueDate: format(new Date(), "yyyy-MM-dd"),
          bookTitle: book.title,
        },
      ]);
    } else {
      removeEbook(book.id ?? "");
    }
  };

  const proceedToAdd = () => {
    updateAccessionsToBorrow(selectedAccessions);
    updateEbooksToBorrow(selectedEbooks);
    closeModal();
  };
  const selectedAccessionCopiesCache = useMemo(
    () =>
      selectedAccessions.reduce<Object>(
        (ac, accession) => ({
          ...ac,
          [`${accession.bookId}_${accession.number}`]: accession,
        }),
        {}
      ),
    [selectedAccessions]
  );

  const selectedEbookCache = useMemo(
    () =>
      selectedEbooks.reduce<Object>(
        (ac, eBook) => ({
          ...ac,
          [eBook.bookId]: eBook,
        }),
        {}
      ),
    [selectedEbooks]
  );
  const handleCheckonRowClick = (accession: Accession) => {
    if (
      !selectedAccessionCopiesCache.hasOwnProperty(
        `${book.id}_${accession.number}`
      )
    ) {
      const date = getDate5DaysFromNow();
      const dateValue = format(date, "yyyy-MM-dd");
      setSelectedAccessions((prevSelected) => [
        ...prevSelected,
        {
          isWeeded: false,
          isAvailable: true,
          book: book,
          id: accession.id,
          bookId: book.id ?? "",
          copyNumber: accession.copyNumber,
          number: accession.number,
          isCheckedOut: false,
          dueDate: dateValue,
        },
      ]);
    } else {
      removeCopy(book.id, accession.number);
    }
  };
  const hasAvailableCopies = useMemo(() => {
    if (book.ebook.length > 0) return true;
    return accessions.some((a) => a.isAvailable);
  }, [accessions]);

  return (
    <Modal onClose={closeModal} show={isOpen} dismissible>
      <Modal.Header>{book.title}</Modal.Header>
      <Modal.Body
        className="small-scroll"
        style={{
          maxHeight: "700px",
        }}
      >
        <LoadingBoundary isError={isError} isLoading={isFetching}>
          {" "}
          <div>
            <Table>
              <Table.Head>
                <Table.HeadCell></Table.HeadCell>
                <Table.HeadCell>Accession number</Table.HeadCell>
                <Table.HeadCell>Copy number</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Type</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {accessions.map((accession) => {
                  const isAdded = selectedAccessionCopiesCache.hasOwnProperty(
                    `${accession.bookId}_${accession.number}`
                  );
                  return (
                    <Table.Row
                      key={accession.number}
                      className={
                        !accession.isAvailable
                          ? "bg-gray-100 hover:bg-gray-100 pointer-events-none "
                          : "cursor-pointer"
                      }
                      onClick={() => {
                        handleCheckonRowClick(accession);
                      }}
                    >
                      <Table.Cell>
                        <Checkbox
                          color="primary"
                          checked={isAdded}
                          readOnly
                          disabled={!accession.isAvailable}
                        />
                      </Table.Cell>
                      <Table.Cell>{accession.number}</Table.Cell>
                      <Table.Cell>Copy {accession.copyNumber}</Table.Cell>
                      <Table.Cell>
                        {!accession.isAvailable
                          ? "Unavailable"
                          : BorrowStatuses.Available}
                      </Table.Cell>
                      <Table.Cell></Table.Cell>
                    </Table.Row>
                  );
                })}
                {book.ebook.length > 0 && (
                  <Table.Row
                    onClick={() => {
                      handleRowClickOnEbook(book);
                    }}
                  >
                    <Table.Cell>
                      <input
                        type="checkbox"
                        readOnly
                        checked={selectedEbookCache.hasOwnProperty(
                          book.id ?? ""
                        )}
                      />
                    </Table.Cell>
                    <Table.Cell>{book.title}</Table.Cell>
                    <Table.Cell>N/A</Table.Cell>
                    <Table.Cell>N/A</Table.Cell>
                    <Table.Cell>eBook</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
          <div className="flex gap-2 py-3">
            <Button
              color="primary"
              onClick={proceedToAdd}
              disabled={!hasAvailableCopies}
            >
              Save
            </Button>
            <Button color="light" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </LoadingBoundary>
      </Modal.Body>
    </Modal>
  );
};
export default BookCopySelectionModal;
