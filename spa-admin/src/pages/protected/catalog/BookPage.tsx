import CustomDatePicker from "@components/forms/CustomDatePicker";
import CustomSelect from "@components/forms/CustomSelect";
import { ButtonClasses, Input } from "@components/forms/Forms";
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
import { Book, ModalProps } from "@definitions/types";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { AiOutlinePrinter } from "react-icons/ai";
import Modal from "react-responsive-modal";
import { Link } from "react-router-dom";

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
  ] = useState<Book>({} as Book);
  const setBookForPrintingAndOpenModal = (book: Book) => {
    setSelectedBookForPrintingPrintables({ ...book });
    openPrintablesModal();
  };
  const { data: books } = useQuery<Book[]>({
    queryFn: fetchBooks,
    queryKey: ["books"],
  });
  return (
    <>
      {/* <div className="w-full lg:w-11/12  lg:rounded-md mx-auto mb-5 flex">
        <div>
          <h1 className="text-3xl font-bold text-gray-400">Books</h1>
        </div>
        <div className="mb-4">
          <Link
            to="/books/create"
            className={ButtonClasses.PrimaryButtonDefaultClasslist}
          >
            New Book
          </Link>
        </div>
      </div> */}
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
                <BodyRow>
                  <Td>{book.title}</Td>
                  <Td>{book.isbn}</Td>
                  <Td>{book.copies}</Td>
                  <Td>{book.yearPublished}</Td>
                  <Td>
                    <AiOutlinePrinter
                      className="text-blue-500 text-lg cursor-pointer "
                      onClick={() => {
                        setBookForPrintingAndOpenModal(book);
                      }}
                    />
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
  book: Book;
}
export const BookPrintablesModal: React.FC<PrintablesModalProps> = ({
  closeModal,
  isOpen,
}) => {
  if (!isOpen) return null;
  return (
    <Modal open={isOpen} onClose={closeModal}>
      <div></div>
    </Modal>
  );
};

export default BookPage;
