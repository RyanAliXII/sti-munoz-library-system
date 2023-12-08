import HasAccess from "@components/auth/HasAccess";
import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { Book, Section } from "@definitions/types";
import { useBooks, useMigrateCollection } from "@hooks/data-fetching/book";
import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, TextInput } from "flowbite-react";
import { ChangeEvent, useEffect, useMemo, useReducer, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { TbDatabaseImport } from "react-icons/tb";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useSearchParamsState } from "react-use-search-params-state";
import { BookPrintablesModal } from "./BookPrintablesModal";
import ImportBooksModal from "./ImportBooksModal";
import MigrateModal from "./MigrateModal";
import { bookSelectionReducer } from "./bookselection-reducer";
import BookTable from "./BookTable";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import CustomPagination from "@components/pagination/CustomPagination";
import pages from "@pages/Pages";

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
    tags: { type: "string", multiple: true, default: ["test"] },
  });
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
    close: closeImportModal,
    open: openImportModal,
    isOpen: isImportModalOpen,
  } = useSwitch();

  const [bookSelections, dispatchSelection] = useReducer(bookSelectionReducer, {
    books: new Map<string, Book>(),
  });
  const {
    data: bookData,
    isFetching,
    isError,
  } = useBooks({
    onSuccess: (data) => {
      setTotalPages(data?.metadata?.pages ?? 0);
    },
    queryKey: [
      "books",
      {
        keyword: filterParams?.keyword,
        page: filterParams?.page,
        tags: filterParams?.tags,
      },
    ],
  });
  useEffect(() => {
    setFilterParams({ tags: ["test", "ll", "s"] });
  }, []);
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
          <BookTable
            books={bookData?.books ?? []}
            bookSelections={bookSelections}
            onSelect={onSelect}
            setBookForPrintingAndOpenModal={setBookForPrintingAndOpenModal}
          />
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
