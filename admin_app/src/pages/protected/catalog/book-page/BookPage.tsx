import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { Input } from "@components/ui/form/Input";
import {
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
import { ChangeEvent, useState } from "react";
import { AiOutlineEdit, AiOutlinePlus, AiOutlinePrinter } from "react-icons/ai";

import { Link, useSearchParams } from "react-router-dom";

import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

import { useRequest } from "@hooks/useRequest";
import HasAccess from "@components/auth/HasAccess";
import { apiScope } from "@definitions/configs/msal/scopes";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import Tippy from "@tippyjs/react";

import { TbDatabaseImport } from "react-icons/tb";
import ImportBooksModal from "./ImportBooksModal";
import ReactPaginate from "react-paginate";
import usePaginate from "@hooks/usePaginate";
import { isValid } from "date-fns";
import useDebounce from "@hooks/useDebounce";
import { BookPrintablesModal } from "./BookPrintablesModal";

const BookPage = () => {
  const {
    close: closePrintablesModal,
    open: openPrintablesModal,
    isOpen: isPrintablesModalOpen,
  } = useSwitch();
  const [params, _] = useSearchParams();
  const initCurrentPage = () => {
    const page = params.get("page");
    if (!page) {
      return 1;
    }
    const parsedPage = parseInt(page);
    if (isNaN(parsedPage)) {
      return 1;
    }
    if (parsedPage <= 0) {
      return 1;
    }
    return parsedPage;
  };

  const { currentPage, totalPages, setTotalPages, setCurrentPage } =
    usePaginate({
      initialPage: initCurrentPage,
      numberOfPages: 1,
    });
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const { Get } = useRequest();
  const fetchBooks = async () => {
    try {
      const { data: response } = await Get(
        "/books/",
        {
          params: {
            page: currentPage,
            keyword: searchKeyword,
          },
        },
        [apiScope("Book.Read")]
      );
      if (response?.data?.metadata) {
        const page = response?.data?.metadata?.pages;
        setTotalPages(page ?? 0);
      }
      return response?.data?.books ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const searchDebounce = useDebounce();

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    searchDebounce(
      () => {
        setSearchKeyword(event.target.value);
        setCurrentPage(1);
      },
      null,
      500
    );
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
    queryKey: ["books", currentPage, searchKeyword],
  });

  const {
    close: closeImportModal,
    open: openImportModal,
    isOpen: isImportModalOpen,
  } = useSwitch();

  const paginationClass =
    totalPages <= 1 ? "hidden" : "flex gap-2 items-center";
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
        <div className="gap-2 items-center lg:basis-9/12 lg:flex"></div>
      </ContainerNoBackground>
      <ContainerNoBackground>
        <div className="lg:flex gap-2">
          <Input
            type="text"
            placeholder="Search..."
            onChange={handleSearch}
          ></Input>
          <div className="w-full lg:w-5/12  mb-4 ">
            <CustomSelect placeholder="Section" />
          </div>
        </div>
      </ContainerNoBackground>

      <LoadingBoundaryV2 isLoading={isFetching} isError={isError}>
        <Container className="lg:p-0">
          {" "}
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Date Received</Th>
                <Th>Title</Th>

                <Th>Copies</Th>
                <Th>Year Published</Th>

                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {books?.map((book) => {
                return (
                  <BodyRow key={book.id}>
                    <Td>
                      {isValid(new Date(book.receivedAt))
                        ? new Date(book.receivedAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "2-digit", year: "numeric" }
                          )
                        : "Unspecified"}
                    </Td>
                    <Td>{book.title}</Td>
                    {/* <Td className="hidden lg:block">{book.isbn}</Td> */}
                    <Td>{book.copies}</Td>
                    <Td>{book.yearPublished}</Td>

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
        <ContainerNoBackground>
          <ReactPaginate
            nextLabel="Next"
            pageLinkClassName="border px-3 py-0.5  text-center rounded"
            pageRangeDisplayed={5}
            pageCount={totalPages}
            forcePage={currentPage - 1}
            disabledClassName="opacity-60 pointer-events-none"
            onPageChange={({ selected }) => {
              setCurrentPage(selected + 1);
            }}
            className={paginationClass}
            previousLabel="Previous"
            previousClassName="px-2 border text-gray-500 py-1 rounded"
            nextClassName="px-2 border text-blue-500 py-1 rounded"
            renderOnZeroPageCount={null}
            activeClassName="border-none bg-blue-500 text-white rounded"
          />
        </ContainerNoBackground>
      </LoadingBoundaryV2>

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

export default BookPage;
