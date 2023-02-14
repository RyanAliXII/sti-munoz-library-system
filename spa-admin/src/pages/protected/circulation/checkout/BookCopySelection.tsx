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
  BorrowStatuses,
  DetailedAccession,
  ModalProps,
} from "@definitions/types";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Modal from "react-responsive-modal";
import { CheckoutForm } from "./CheckoutPage";
import axiosClient from "@definitions/configs/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface BookCopySelectionProps extends ModalProps {
  book: Book;
  updateAccessionsToBorrow: (accesions: DetailedAccession[]) => void;
  form: CheckoutForm;
}
const BookCopySelectionModal = ({
  closeModal,
  isOpen,
  book,
  updateAccessionsToBorrow,
  form,
}: BookCopySelectionProps) => {
  const [selectedAccessions, setSelectedAccessions] = useState<
    DetailedAccession[]
  >([]);

  const fetchAccessionById = async () => {
    try {
      const { data: response } = await axiosClient.get(
        `/books/${book.id}/accessions`
      );
      return response?.data?.accessions ?? [];
    } catch {
      return [];
    }
  };

  const { data: accessions, refetch } = useQuery<DetailedAccession[]>({
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
      refetch();
    } else {
      setSelectedAccessions([]);
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

  const proceedToAdd = () => {
    updateAccessionsToBorrow(selectedAccessions);
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
  const handleCheck = (
    event: ChangeEvent<HTMLInputElement>,
    accession: Accession
  ) => {
    if (event.target.checked) {
      setSelectedAccessions((prevSelected) => [
        ...prevSelected,
        {
          authorNumber: book.authorNumber,
          bookId: book.id ?? "",
          copyNumber: accession.copyNumber,
          number: accession.number,
          ddc: book.ddc,
          section: book.section,
          title: book.title,
          yearPublished: book.yearPublished,
          isCheckedOut: false,
        },
      ]);
    } else {
      removeCopy(book.id, accession.number);
    }
  };
  const handleCheckonRowClick = (accession: Accession) => {
    if (
      !selectedAccessionCopiesCache.hasOwnProperty(
        `${book.id}_${accession.number}`
      )
    ) {
      setSelectedAccessions((prevSelected) => [
        ...prevSelected,
        {
          authorNumber: book.authorNumber,
          bookId: book.id ?? "",
          copyNumber: accession.copyNumber,
          number: accession.number,
          ddc: book.ddc,
          section: book.section,
          title: book.title,
          yearPublished: book.yearPublished,
          isCheckedOut: false,
        },
      ]);
    } else {
      removeCopy(book.id, accession.number);
    }
  };

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
      <div>
        <h1 className="mb-5 text-xl">{book.title}</h1>
        <Table>
          <Thead>
            <HeadingRow>
              <Th></Th>
              <Th>Accession number</Th>
              <Th>Copy number</Th>
              <Th>Status</Th>
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
                    accession.isCheckedOut
                      ? "bg-gray-100 hover:bg-gray-100 cursor-pointer"
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
                      disabled={accession.isCheckedOut}
                      onChange={(event) => {
                        handleCheck(event, accession);
                      }}
                    />
                  </Td>
                  <Td>{accession.number}</Td>
                  <Td>Copy {accession.copyNumber}</Td>
                  <Td>
                    {accession.isCheckedOut
                      ? BorrowStatuses.CheckedOut
                      : BorrowStatuses.Available}
                  </Td>
                </BodyRow>
              );
            })}
            <BodyRow></BodyRow>
          </Tbody>
        </Table>
      </div>
      <PrimaryButton className="mt-5" onClick={proceedToAdd}>
        Add changes
      </PrimaryButton>
      <LighButton className="ml-2" onClick={closeModal}>
        Cancel
      </LighButton>
    </Modal>
  );
};
export default BookCopySelectionModal;
