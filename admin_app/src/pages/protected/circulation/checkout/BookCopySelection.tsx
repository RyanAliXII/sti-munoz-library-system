import { LighButton, PrimaryButton } from "@components/ui/button/Button";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import {
  Accession,
  Book,
  DetailedAccession,
  ModalProps,
} from "@definitions/types";
import { useEffect, useMemo, useState } from "react";
import Modal from "react-responsive-modal";
import { CheckoutAccession, CheckoutForm, BorrowedEbook } from "./CheckoutPage";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BorrowStatuses } from "@internal/borrow-status";
import { useRequest } from "@hooks/useRequest";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import { format } from "date-fns";

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
      const dateValue = `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}`;
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
      <LoadingBoundary isError={isError} isLoading={isFetching}>
        {" "}
        <div>
          <h1 className="mb-5 text-xl">{book.title}</h1>
          <Table>
            <Thead>
              <HeadingRow>
                <Th></Th>
                <Th>Accession number</Th>
                <Th>Copy number</Th>
                <Th>Status</Th>
                <Th>Type</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {accessions.map((accession) => {
                const isAdded = selectedAccessionCopiesCache.hasOwnProperty(
                  `${accession.bookId}_${accession.number}`
                );
                return (
                  <BodyRow
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
                    <Td>
                      <input
                        type="checkbox"
                        checked={isAdded}
                        readOnly
                        disabled={!accession.isAvailable}
                      />
                    </Td>
                    <Td>{accession.number}</Td>
                    <Td>Copy {accession.copyNumber}</Td>
                    <Td>
                      {!accession.isAvailable
                        ? "Unavailable"
                        : BorrowStatuses.Available}
                    </Td>
                    <Td></Td>
                  </BodyRow>
                );
              })}
              {book.ebook.length > 0 && (
                <BodyRow
                  onClick={() => {
                    handleRowClickOnEbook(book);
                  }}
                >
                  <Td>
                    <input
                      type="checkbox"
                      readOnly
                      checked={selectedEbookCache.hasOwnProperty(book.id ?? "")}
                    />
                  </Td>
                  <Td>{book.title}</Td>
                  <Td>N/A</Td>
                  <Td>N/A</Td>
                  <Td>eBook</Td>
                </BodyRow>
              )}
            </Tbody>
          </Table>
        </div>
      </LoadingBoundary>

      <PrimaryButton
        className="mt-5"
        onClick={proceedToAdd}
        disabled={!hasAvailableCopies}
      >
        Save
      </PrimaryButton>
      <LighButton className="ml-2" onClick={closeModal}>
        Cancel
      </LighButton>
    </Modal>
  );
};
export default BookCopySelectionModal;
