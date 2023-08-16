import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { Input } from "@components/ui/form/Input";
import {
  PrimaryButton,
  SecondaryButton,
  ButtonClasses,
} from "@components/ui/button/Button";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import { Book, ModalProps } from "@definitions/types";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { AiOutlineEdit, AiOutlinePrinter } from "react-icons/ai";
import Modal from "react-responsive-modal";
import QRCode from "react-qr-code";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";
import TimeAgo from "timeago-react";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

import { useRequest } from "@hooks/useRequest";
import HasAccess from "@components/auth/HasAccess";
import { apiScope } from "@definitions/configs/msal/scopes";
import LoadingBoundary from "@components/loader/LoadingBoundary";
import Tippy from "@tippyjs/react";

const BookPage = () => {
  const {
    close: closePrintablesModal,
    open: openPrintablesModal,
    isOpen: isPrintablesModalOpen,
  } = useSwitch();

  const { Get } = useRequest();
  const fetchBooks = async () => {
    try {
      const { data: response } = await Get("/books/", {}, [
        apiScope("Book.Read"),
      ]);
      return response?.data?.books ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const [
    selectedBookForPrintingPrintables,
    setSelectedBookForPrintingPrintables,
  ] = useState<Book>({} as Book);
  const setBookForPrintingAndOpenModal = (book: Book) => {
    setSelectedBookForPrintingPrintables({ ...book });
    openPrintablesModal();
  };
  const {
    data: books,
    isError,
    isFetching,
  } = useQuery<Book[]>({
    queryFn: fetchBooks,
    queryKey: ["books"],
  });
  return (
    <>
      <ContainerNoBackground className="flex gap-2 justify-between px-0 mb-0 lg:mb-4">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-gray-700">Books</h1>
        </div>
        <div className="gap-2 items-center lg:basis-9/12 lg:flex">
          <div className="w-5/12 hidden lg:block">
            <Input type="text" label="Search" placeholder="Search..."></Input>
          </div>
          <div className="hidden lg:block">
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
          <div className="w-3/12 hidden lg:block mb-4 ">
            <CustomSelect label="Section" />
          </div>
          <div className="w-32 mt-1">
            <HasAccess requiredPermissions={["Book.Access"]}>
              <Link
                to="/books/new"
                className={`${ButtonClasses.PrimaryButtonDefaultClasslist} py-2.5`}
              >
                New Book
              </Link>
            </HasAccess>
          </div>
        </div>
      </ContainerNoBackground>
      <ContainerNoBackground className="px-0 flex gap-2 lg:hidden">
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
      </ContainerNoBackground>
      <LoadingBoundary isLoading={isFetching} isError={isError}>
        <Container className="lg:p-0">
          {" "}
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Title</Th>
                {/* <Th className="hidden lg:block">ISBN</Th> */}
                <Th>Copies</Th>
                <Th>Year Published</Th>
                <Th>Date Received</Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {books?.map((book) => {
                return (
                  <BodyRow key={book.id}>
                    <Td>{book.title}</Td>
                    {/* <Td className="hidden lg:block">{book.isbn}</Td> */}
                    <Td>{book.copies}</Td>
                    <Td>{book.yearPublished}</Td>
                    <Td>
                      {" "}
                      <TimeAgo datetime={book.receivedAt}></TimeAgo>
                    </Td>
                    <Td className="flex gap-3">
                      <Tippy content="View Printables">
                        <button
                          className={
                            ButtonClasses.PrimaryOutlineButtonClasslist
                          }
                        >
                          <AiOutlinePrinter
                            className="text-blue-500 text-lg cursor-pointer "
                            onClick={() => {
                              setBookForPrintingAndOpenModal(book);
                            }}
                          />
                        </button>
                      </Tippy>
                      <Tippy content="Edit Book">
                        <Link
                          to={`/books/edit/${book.id}`}
                          className={
                            ButtonClasses.SecondaryOutlineButtonClasslist
                          }
                        >
                          <HasAccess requiredPermissions={["Book.Access"]}>
                            <AiOutlineEdit className="text-yellow-500 text-lg cursor-pointer " />
                          </HasAccess>
                        </Link>
                      </Tippy>
                    </Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </Container>
      </LoadingBoundary>

      <BookPrintablesModal
        closeModal={closePrintablesModal}
        isOpen={isPrintablesModalOpen}
        book={selectedBookForPrintingPrintables}
      />
    </>
  );
};
interface PrintablesModalProps extends ModalProps {
  book: Book;
}
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
        modal: "w-11/12  lg:w-8/12  xl:w-5/12 xl: rounded h-[900-px]",
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
          <div className="w-full flex justify-center">
            <small>Title card</small>
          </div>
          <TitleCard book={book}></TitleCard>
          <div className="w-full flex justify-center">
            <small>Author card</small>
          </div>
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
                  accessionId={accession.id ?? ""}
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
  const peopleAuthors = book?.authors.people?.map(
    (author) => `${author.givenName} ${author.surname}`
  );
  const orgAuthors = book?.authors.organizations?.map((org) => org.name);
  const publisherAuthors = book?.authors.publishers.map((p) => p.name);
  const authors = [...peopleAuthors, ...orgAuthors, ...publisherAuthors];
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
              {book.publisher.name} {book.yearPublished}
            </span>
            <span>{book.pages} p.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthorCard = ({ book }: CardProps) => {
  const peopleAuthors = book?.authors.people?.map(
    (author) => `${author.givenName} ${author.surname}`
  );
  const orgAuthors = book?.authors.organizations?.map((org) => org.name);
  const publisherAuthors = book?.authors.publishers.map((p) => p.name);
  const authors = [...peopleAuthors, ...orgAuthors, ...publisherAuthors];
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
              {book.publisher.name} {book.yearPublished}
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
  accessionId: string;
}
const CallNumber = ({
  book,
  copyNumber,
  accessionNumber,
  accessionId,
}: CallNumberProps) => {
  return (
    <div className="flex border border-dashed border-gray-400  px-2 justify-center py-3">
      <div className="p-5">
        <QRCode value={accessionId} className="w-16 h-16"></QRCode>
      </div>
      <div className="w-32 h-28 border-gray-400 border border-dashed flex flex-col px-2">
        <span>{book.section.name?.substring(0, 3)}</span>
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
