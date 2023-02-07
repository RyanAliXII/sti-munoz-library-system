import { Input, PrimaryButton } from "@components/forms/Forms";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";

import {
  Accession,
  Book,
  DetailedAccession,
  ModalProps,
} from "@definitions/types";
import { useEffect, useState } from "react";
import Modal from "react-responsive-modal";
import { CheckoutForm } from "./CheckoutPage";

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

  useEffect(() => {
    if (isOpen) {
      setSelectedAccessions([...form.accessions]);
    }
  }, [isOpen]);

  const removeAccession = (
    bookId: string | undefined,
    accessionNumber: number
  ) => {
    if (!bookId) return;
    setSelectedAccessions((prevSelected) => [
      ...prevSelected.filter(
        (a) => a.bookId != bookId && a.number != accessionNumber
      ),
    ]);
  };
  const handleCheck = (accession: Accession) => {
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
      },
    ]);
  };
  const proceedToAdd = () => {
    updateAccessionsToBorrow(selectedAccessions);
    closeModal();
  };
  if (!isOpen) return null;
  return (
    <Modal
      center
      onClose={closeModal}
      open={isOpen}
      showCloseIcon={false}
      classNames={{
        modal: "w-11/12 md:w-1/3 lg:w-1/4 rounded",
      }}
    >
      <div>
        <h1 className="mb-3">{book.title}</h1>
        <Table>
          <Thead>
            <HeadingRow>
              <Th></Th>
              <Th>Accession number</Th>
              <Th>Copy number</Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {book.accessions.map((accession) => {
              const isAdded = selectedAccessions.some(
                (a) => a.bookId === book.id && a.number === accession.number
              );

              return (
                <BodyRow key={accession.number}>
                  <Td>
                    <Input
                      type="checkbox"
                      checked={isAdded}
                      onChange={(event) => {
                        if (event.target.checked) {
                          handleCheck(accession);
                        } else {
                          removeAccession(book.id, accession.number);
                        }
                      }}
                    />
                  </Td>
                  <Td>{accession.number}</Td>
                  <Td>Copy {accession.copyNumber}</Td>
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
    </Modal>
  );
};
export default BookCopySelectionModal;
