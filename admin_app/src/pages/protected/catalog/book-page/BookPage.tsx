import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { Input } from "@components/ui/form/Input";
import {
  PrimaryButton,
  SecondaryButton,
  ButtonClasses,
  LighButton,
  PrimaryOutlineButton,
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
import { AiOutlineEdit, AiOutlinePlus, AiOutlinePrinter } from "react-icons/ai";
import Modal from "react-responsive-modal";

import { Link } from "react-router-dom";
import TimeAgo from "timeago-react";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

import { useRequest } from "@hooks/useRequest";
import HasAccess from "@components/auth/HasAccess";
import { apiScope } from "@definitions/configs/msal/scopes";
import LoadingBoundary, {
  LoadingBoundaryV2,
} from "@components/loader/LoadingBoundary";
import Tippy from "@tippyjs/react";
import axios from "axios";
import { TbDatabaseImport } from "react-icons/tb";
import ImportBooksModal from "./ImportBooksModal";

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

  const {
    close: closeImportModal,
    open: openImportModal,
    isOpen: isImportModalOpen,
  } = useSwitch();
  return (
    <>
      <ContainerNoBackground className="flex gap-2 justify-between px-0 mb-0 lg:mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-700">Books</h1>
          <div className="mt-1 gap-2 flex items-center">
            <HasAccess requiredPermissions={["Book.Access"]}>
              <Link
                to="/books/new"
                className={`${ButtonClasses.PrimaryButtonDefaultClasslist} px-3 py-2.5 gap-0.5 flex items-center`}
              >
                <AiOutlinePlus className="text-lg" />
                New Book
              </Link>
              <PrimaryOutlineButton
                className="flex items-center gap-0.5"
                onClick={openImportModal}
              >
                <TbDatabaseImport className="text-lg" />
                Import
              </PrimaryOutlineButton>
            </HasAccess>
          </div>
        </div>
        <div className="gap-2 items-center lg:basis-9/12 lg:flex">
          {/* <div className="w-5/12 hidden lg:block">
            <Input type="text" label="Search" placeholder="Search..."></Input>
          </div> */}
          {/* <div className="hidden lg:block">
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
          </div> */}
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
                          onClick={() => {
                            setBookForPrintingAndOpenModal(book);
                          }}
                        >
                          <AiOutlinePrinter className="text-blue-500 text-lg cursor-pointer " />
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
      <ImportBooksModal
        closeModal={closeImportModal}
        isOpen={isImportModalOpen}
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

  const fetchPDF = async () => {
    const response = await axios.get(
      `http://localhost:5200/printables/books/${book.id}`,
      {
        responseType: "blob",
      }
    );
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
export default BookPage;
