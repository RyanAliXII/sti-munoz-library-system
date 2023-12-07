import { Book, Section } from "@definitions/types";
import { useSwitch } from "@hooks/useToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useMemo, useReducer, useState } from "react";
import { AiOutlineEdit, AiOutlinePlus, AiOutlinePrinter } from "react-icons/ai";
import { Link } from "react-router-dom";
import Container from "@components/ui/container/Container";
import HasAccess from "@components/auth/HasAccess";
import { useRequest } from "@hooks/useRequest";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import Tippy from "@tippyjs/react";
import { TbDatabaseImport } from "react-icons/tb";
import ImportBooksModal from "./ImportBooksModal";
import useDebounce from "@hooks/useDebounce";
import { isValid } from "date-fns";
import { Button, Checkbox, Dropdown, Table, TextInput } from "flowbite-react";
import { useSearchParamsState } from "react-use-search-params-state";
import { BookPrintablesModal } from "./BookPrintablesModal";
import CustomPagination from "@components/pagination/CustomPagination";
import { bookSelectionReducer } from "./bookselection-reducer";
import { array } from "yup";
import MigrateModal from "./MigrateModal";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { useMigrateCollection } from "@hooks/data-fetching/book";
import { toast } from "react-toastify";

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

  const [bookSelections, dispatchSelection] = useReducer(bookSelectionReducer, {
    books: new Map<string, Book>(),
  });

  const onSelect = (event: ChangeEvent<HTMLInputElement>, book: Book) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      dispatchSelection({
        payload: {
          single: book,
        },
        type: "select",
      });
      return;
    }
    dispatchSelection({
      payload: {
        single: book,
      },
      type: "unselect",
    });
  };
  const firstSelectedBook = bookSelections.books.entries().next().value?.[1] as
    | Book
    | undefined;

  const isSelectionsSameAccessionTable = useMemo(
    () =>
      Array.from(bookSelections.books).every(([key, book]) => {
        return (
          firstSelectedBook?.section?.accessionTable ===
          book.section.accessionTable
        );
      }),
    [bookSelections.books]
  );
  const migrateModal = useSwitch();
  const confirmMigration = useSwitch();
  const migrate = () => {
    if (isSelectionsSameAccessionTable && bookSelections.books.size > 0) {
      migrateModal.open();
    }
  };
  const queryClient = useQueryClient();
  const [sectionId, setSectionId] = useState<number>(0);
  const migrateCollection = useMigrateCollection({
    onSuccess: () => {
      queryClient.invalidateQueries(["books"]);
      toast.success("Books migrated to another collection.");
    },
  });
  const onProceedMigration = (section: Section) => {
    if (!firstSelectedBook) return;
    if (section.accessionTable != firstSelectedBook.section.accessionTable) {
      confirmMigration.open();
      setSectionId(section.id ?? 0);
      return;
    }
    migrateCollection.mutate({
      sectionId: section.id ?? 0,
      bookIds: Array.from(bookSelections.books.keys()),
    });
  };
  const onConfirmMigrate = () => {
    confirmMigration.close();
    migrateCollection.mutate({
      sectionId: sectionId,
      bookIds: Array.from(bookSelections.books.keys()),
    });
  };

  return (
    <>
      <Container>
        <div className="p-2 flex justify-between ">
          <div className="flex gap-2">
            <form>
              <TextInput
                onChange={handleSearch}
                placeholder="Search books"
                defaultValue={filterParams?.keyword}
              />
            </form>
            {isSelectionsSameAccessionTable &&
              bookSelections.books.size > 0 && (
                <Button onClick={migrate}>Migrate</Button>
              )}
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
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <Table.Head>
                  <Table.HeadCell></Table.HeadCell>
                  <Table.HeadCell>Title</Table.HeadCell>
                  <Table.HeadCell>Authors</Table.HeadCell>
                  <Table.HeadCell>Copies</Table.HeadCell>
                  <Table.HeadCell>Year Published</Table.HeadCell>
                  <Table.HeadCell></Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y dark:divide-gray-700">
                  {books?.map((book) => {
                    const author = book.authors?.[0]?.name ?? "";
                    return (
                      <Table.Row key={book.id}>
                        <Table.Cell>
                          <Checkbox
                            color="primary"
                            checked={bookSelections.books.has(book?.id ?? "")}
                            onChange={(event) => {
                              onSelect(event, book);
                            }}
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <div className="text-base font-semibold text-gray-900 dark:text-white">
                            {book.title}
                          </div>
                          <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            {book.section.name}
                          </div>
                        </Table.Cell>
                        <Table.Cell>{author}</Table.Cell>
                        <Table.Cell>{book.copies}</Table.Cell>
                        <Table.Cell>{book.yearPublished}</Table.Cell>

                        <Table.Cell className="flex gap-3">
                          <Tippy content="View Printables">
                            <Button
                              color="primary"
                              onClick={() => {
                                setBookForPrintingAndOpenModal(book);
                              }}
                            >
                              <AiOutlinePrinter className="text-lg cursor-pointer " />
                            </Button>
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
                              <Button
                                as={Link}
                                color="secondary"
                                to={`/books/edit/${book.id}`}
                              >
                                <AiOutlineEdit className="text-lg cursor-pointer" />
                              </Button>
                            </Tippy>
                          </HasAccess>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
              <div className="p-4">
                <CustomPagination
                  nextLabel="Next"
                  pageRangeDisplayed={5}
                  pageCount={totalPages}
                  forcePage={filterParams?.page - 1}
                  onPageChange={({ selected }) => {
                    setFilterParams({ page: selected + 1 });
                  }}
                  isHidden={totalPages <= 1}
                  previousLabel="Previous"
                  renderOnZeroPageCount={null}
                />
              </div>
            </div>
          </div>
        </LoadingBoundaryV2>
      </Container>
      <MigrateModal
        closeModal={migrateModal.close}
        isOpen={migrateModal.isOpen}
        onProceed={onProceedMigration}
      />
      <BookPrintablesModal
        closeModal={closePrintablesModal}
        isOpen={isPrintablesModalOpen}
        book={selectedBookForPrintingPrintables}
      />
      <ImportBooksModal
        closeModal={closeImportModal}
        isOpen={isImportModalOpen}
      />
      <DangerConfirmDialog
        close={confirmMigration.close}
        isOpen={confirmMigration.isOpen}
        title="Collection Migration"
        onConfirm={onConfirmMigrate}
        text="The system detected that the current collection is not related nor sub-collection of selected collection. This will result in accession number regeneration. Are you sure you want to proceed?"
      />
    </>
  );
};

export default BookPage;
