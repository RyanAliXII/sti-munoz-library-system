import CustomDatePicker from "@components/forms/CustomDatePicker";
import CustomSelect from "@components/forms/CustomSelect";
import {
  ButtonClasses,
  Input,
  PrimaryButton,
  SecondaryButton,
} from "@components/forms/Forms";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";
import axiosClient from "@definitions/configs/axios";
import { Accession, Book, ModalProps } from "@definitions/types";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { AiOutlineEdit, AiOutlinePrinter } from "react-icons/ai";
import Modal from "react-responsive-modal";
import QRCode from "react-qr-code";
import jsonpack from "jsonpack";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
interface BookWithAccession extends Book {
  accessions: PrintableAccession[];
}
const BookPage = () => {
  const {
    close: closePrintablesModal,
    open: openPrintablesModal,
    isOpen: isPrintablesModalOpen,
  } = useSwitch();
  const fetchBooks = async () => {
    try {
      const { data: response } = await axiosClient.get("/books/");
      return response.data.books ?? [];
    } catch (error) {
      console.error(error);
    }
  };

  const [
    selectedBookForPrintingPrintables,
    setSelectedBookForPrintingPrintables,
  ] = useState<BookWithAccession>({} as BookWithAccession);
  const setBookForPrintingAndOpenModal = (book: BookWithAccession) => {
    setSelectedBookForPrintingPrintables({ ...book });
    openPrintablesModal();
  };
  const { data: books } = useQuery<BookWithAccession[]>({
    queryFn: fetchBooks,
    queryKey: ["books"],
  });
  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5 flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">Books</h1>
        <Link
          to="/books/new"
          className={ButtonClasses.PrimaryButtonDefaultClasslist}
        >
          New Book
        </Link>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 first-letter: drop-shadow-md lg:rounded-md mx-auto mb-4 flex gap-2">
        <div className="w-5/12">
          <Input type="text" label="Search" placeholder="Search.."></Input>
        </div>
        <div>
          <CustomDatePicker
            label="Year Published"
            wrapperclass="flex flex-col"
            selected={new Date()}
            onChange={() => {}}
            showYearPicker
            dateFormat="yyyy"
            yearItemNumber={9}
          />
        </div>
        <div className="w-3/12">
          <CustomSelect label="Section" />
        </div>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 drop-shadow-md lg:rounded-md mx-auto">
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Title</Th>
              <Th>ISBN</Th>
              <Th>Copies</Th>
              <Th>Year Published</Th>
              <Th></Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {books?.map((book) => {
              return (
                <BodyRow key={book.id}>
                  <Td>{book.title}</Td>
                  <Td>{book.isbn}</Td>
                  <Td>{book.copies}</Td>
                  <Td>{book.yearPublished}</Td>
                  <Td className="flex gap-5">
                    <AiOutlinePrinter
                      className="text-blue-500 text-lg cursor-pointer "
                      onClick={() => {
                        setBookForPrintingAndOpenModal(book);
                      }}
                    />
                    <Link to={`/books/edit/${book.id}`}>
                      <AiOutlineEdit className="text-yellow-500 text-lg cursor-pointer " />
                    </Link>
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
      </div>

      <BookPrintablesModal
        closeModal={closePrintablesModal}
        isOpen={isPrintablesModalOpen}
        book={selectedBookForPrintingPrintables}
      />
    </>
  );
};
interface PrintablesModalProps extends ModalProps {
  book: BookWithAccession;
}
type PrintableAccession = Omit<
  Accession,
  "ddc" | " authorNumber" | "bookId" | "section" | "yearPublished" | "title"
>;
export const BookPrintablesModal: React.FC<PrintablesModalProps> = ({
  closeModal,
  isOpen,
  book,
}) => {
  const printableDiv = useRef<HTMLDivElement | null>(null);
  const download = async () => {
    if (!printableDiv.current) return;
    const canvas = await html2canvas(printableDiv.current, { scale: 4 });
    const doc = new jsPDF("p", "px", "a4");

    doc.addImage(canvas, 10, 0, 350, 450);
    doc.save(`${book.title}_${book.yearPublished}.pdf`);
  };
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
        modal: "w-11/12  lg:w-8/12  xl:w-5/12 xl: rounded h-[700px]",
      }}
    >
      <div
        className="w-6/12 py-2 mx-auto"
        ref={printableDiv}
        style={{
          minWidth: "650px",
        }}
      >
        <div className="flex flex-col w-full gap-2 mb-2 ">
          <TitleCard book={book}></TitleCard>

          <AuthorCard book={book}></AuthorCard>
        </div>
        <div className="flex justify-center">
          <div className="grid grid-cols-3 gap-2">
            {book?.accessions?.map((accession) => {
              return (
                <CallNumber
                  key={`${accession.copyNumber}_${book.title}`}
                  book={book}
                  accessionNumber={accession.number}
                  copyNumber={accession.copyNumber}
                ></CallNumber>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 w-full border-t py-2">
        <div className="float-right py-2">
          <PrimaryButton className="mr-2 w-32" type="button" onClick={download}>
            Download
          </PrimaryButton>
          <SecondaryButton className="w-32">Print</SecondaryButton>
        </div>
      </div>
    </Modal>
  );
};

type CardProps = {
  book: Book;
};
const TitleCard = ({ book }: CardProps) => {
  const authors = book?.authors?.map(
    (author) => `${author.givenName} ${author.surname}`
  );
  return (
    <div className=" h-80 border-gray-400 border border-dashed">
      <div className="flex h-full">
        <div className="h-full">
          <div className="mt-14 px-10">
            <small className="block">{book.ddc}</small>
            <small>{book.authorNumber}</small>
          </div>
        </div>
        <div className="w-full flex items-center">
          <div className="px-3">
            <big className="block">{book.title} </big>
            <span>{authors.join(" , ")}</span>
            <span className="block">
              {book.publisher} {book.yearPublished}
            </span>
            <span>{book.pages} p.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthorCard = ({ book }: CardProps) => {
  const authors = book.authors.map((author) => {
    return `${author.givenName} ${author.surname}`;
  });
  return (
    <div className="h-80 border-gray-400 border border-dashed">
      <div className="flex h-full">
        <div className="h-full">
          <div className="mt-14 px-10">
            <small className="block">{book.ddc}</small>
            <small>{book.authorNumber}</small>
          </div>
        </div>
        <div className="w-full flex items-center">
          <div className="px-3">
            <big>{authors.join(" , ")}</big>
            <span className="block">{book.title} </span>
            <span className="block">
              {book.publisher} {book.yearPublished}
            </span>
            <span>{book.pages} p.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CallNumberProps extends CardProps {
  copyNumber: number;
  accessionNumber: number;
}
const CallNumber = ({ book, copyNumber, accessionNumber }: CallNumberProps) => {
  const qrValue = jsonpack.pack(
    JSON.stringify({ bookId: book.id, accessionNumber: accessionNumber })
  );
  return (
    <div className="flex border border-dashed border-gray-400  px-2 justify-center py-3">
      <div className="p-5">
        <QRCode value={qrValue} className="w-16 h-16"></QRCode>
      </div>
      <div className="w-32 h-28 border-gray-400 border border-dashed flex flex-col px-2">
        <span>{book.section?.substring(0, 3)}</span>
        <small className="tracking-wide">
          {book.title.charAt(0)}
          {book.ddc}
        </small>
        <small>{book.authorNumber}</small>
        <small>{book.yearPublished}</small>
        <small>c.{copyNumber}</small>
      </div>
    </div>
  );
};
export default BookPage;
