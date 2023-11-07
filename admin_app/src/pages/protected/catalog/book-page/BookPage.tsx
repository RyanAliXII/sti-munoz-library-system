import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { Input } from "@components/ui/form/Input";
import {
  ButtonClasses,
  LighButton,
  PrimaryOutlineButton,
} from "@components/ui/button/Button";
// import {
//   BodyRow,
//   HeadingRow,
//   Table,
//   Tbody,
//   Table.Cell,
//   Th,
//   Thead,
// } from "@components/ui/table/Table";

import { Book } from "@definitions/types";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent, useState } from "react";
import { AiOutlineEdit, AiOutlinePlus, AiOutlinePrinter } from "react-icons/ai";

import { Link } from "react-router-dom";

import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

import { useRequest } from "@hooks/useRequest";
import HasAccess from "@components/auth/HasAccess";

import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import Tippy from "@tippyjs/react";

import { TbDatabaseImport } from "react-icons/tb";
import ImportBooksModal from "./ImportBooksModal";
import ReactPaginate from "react-paginate";

import { isValid } from "date-fns";
import useDebounce from "@hooks/useDebounce";
import { BookPrintablesModal } from "./BookPrintablesModal";
import { Button, Table, TextInput } from "flowbite-react";
import { useSearchParamsState } from "react-use-search-params-state";

const BookPage = () => {
  const {
    close: closePrintablesModal,
    open: openPrintablesModal,
    isOpen: isPrintablesModalOpen,
  } = useSwitch();

  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
  });
  const { Get } = useRequest();
  const fetchBooks = async () => {
    try {
      const { data: response } = await Get("/books/", {
        params: {
          page: filterParams?.page,
          keyword: filterParams?.keyword,
        },
      });
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
        setFilterParams({ page: 1, keyword: event.target.value });
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
    queryKey: ["books", filterParams],
  });

  const {
    close: closeImportModal,
    open: openImportModal,
    isOpen: isImportModalOpen,
  } = useSwitch();

  const paginationClass =
    totalPages <= 1 ? "hidden" : "inline-flex -space-x-px text-sm";
  return (
    <>
      {/* <ContainerNoBackground className="flex gap-2 justify-between px-0 mb-0 lg:mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-700">Books</h1>
          <div className="mt-1 gap-2 flex items-center">
            <HasAccess
              requiredPermissions={[
                "Book.Access",
                "Publisher.Access",
                "Section.Access",
                "Author.Access",
              ]}
            >
              <Link
                to="/books/new"
                className={`${ButtonClasses.PrimaryButtonDefaultClasslist} px-3 py-2.5 gap-0.5 flex items-center`}
              >
                
                New Book
              </Link>
            </HasAccess>
            <HasAccess requiredPermissions={["Book.Access", "Section.Access"]}>
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
           
            
          ></Input>
          <div className="w-full lg:w-5/12  mb-4 ">
            <CustomSelect placeholder="Section" />
          </div>
        </div>
      </ContainerNoBackground> */}

      <Container>
        <div className="p-2 flex justify-between ">
          <div>
            <form>
              <TextInput
                onChange={handleSearch}
                placeholder="Search books"
                defaultValue={filterParams?.keyword}
              />
            </form>
          </div>

          <div className="flex gap-2">
            <HasAccess
              requiredPermissions={[
                "Book.Access",
                "Publisher.Access",
                "Section.Access",
                "Author.Access",
              ]}
            >
              <Button color="primary" to="/books/new" as={Link}>
                <AiOutlinePlus /> New Book
              </Button>
            </HasAccess>
            <HasAccess requiredPermissions={["Book.Access", "Section.Access"]}>
              <Button
                outline
                gradientDuoTone={"blueToBlue"}
                className="border border-primary-500 text-primary-500 dark:border-primary-500 dark:text-primary-400"
                onClick={openImportModal}
              >
                <TbDatabaseImport className="text-lg" />
                Import
              </Button>
            </HasAccess>
          </div>
        </div>
        <LoadingBoundaryV2 isLoading={isFetching} isError={isError}>
          <Table>
            <Table.Head>
              <Table.HeadCell>Date Received</Table.HeadCell>
              <Table.HeadCell>Title</Table.HeadCell>
              <Table.HeadCell>Copies</Table.HeadCell>
              <Table.HeadCell>Year Published</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {books?.map((book) => {
                return (
                  <Table.Row key={book.id}>
                    <Table.Cell>
                      {isValid(new Date(book.receivedAt))
                        ? new Date(book.receivedAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "2-digit", year: "numeric" }
                          )
                        : "Unspecified"}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {book.title}
                      </div>
                      <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {book.section.name}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{book.copies}</Table.Cell>
                    <Table.Cell>{book.yearPublished}</Table.Cell>

                    <Table.Cell className="flex gap-3">
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
                      <HasAccess
                        requiredPermissions={[
                          "Book.Access",
                          "Publisher.Access",
                          "Section.Access",
                          "Author.Access",
                        ]}
                      >
                        <Tippy content="Edit Book">
                          <Link
                            to={`/books/edit/${book.id}`}
                            className={
                              ButtonClasses.SecondaryOutlineButtonClasslist
                            }
                          >
                            <AiOutlineEdit className="text-yellow-500 text-lg cursor-pointer " />
                          </Link>
                        </Tippy>
                      </HasAccess>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
          <div className="p-4">
            <ReactPaginate
              nextLabel="Next"
              pageLinkClassName="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              pageRangeDisplayed={5}
              pageCount={totalPages}
              forcePage={filterParams?.page - 1}
              disabledClassName="opacity-60 pointer-events-none"
              onPageChange={({ selected }) => {
                setFilterParams({ page: selected + 1 });
              }}
              className={paginationClass}
              previousLabel="Previous"
              previousClassName="flex items-center justify-center px-4 h-10 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              nextClassName="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              activeLinkClassName="text-blue-700 bg-blue-200 dark:bg-blue-700 dark:text-gray-100"
              renderOnZeroPageCount={null}
            />
          </div>
        </LoadingBoundaryV2>
      </Container>

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
