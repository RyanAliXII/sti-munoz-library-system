import HasAccess from "@components/auth/HasAccess";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import CustomPagination from "@components/pagination/CustomPagination";
import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { Book, Section } from "@definitions/types";
import { useBooks, useMigrateCollection } from "@hooks/data-fetching/book";
import { useCollections } from "@hooks/data-fetching/collection";
import { useSearchTags } from "@hooks/data-fetching/search-tag";
import useDebounce from "@hooks/useDebounce";
import { useSwitch } from "@hooks/useToggle";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Dropdown, Label, TextInput } from "flowbite-react";
import { ChangeEvent, useMemo, useReducer, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { MdFilterList, MdOutlineDownload } from "react-icons/md";
import { TbDatabaseImport } from "react-icons/tb";
import { Link } from "react-router-dom";
import { MultiValue } from "react-select";
import { toast } from "react-toastify";
import { useSearchParamsState } from "react-use-search-params-state";
import { BookPrintablesModal } from "./BookPrintablesModal";
import BookTable from "./BookTable";
import ImportBooksModal from "./ImportBooksModal";
import MigrateModal from "./MigrateModal";
import { bookSelectionReducer } from "./bookselection-reducer";
import PreviewModal from "./PreviewModal";
import { BookInitialValue } from "@definitions/defaults";
import ExportBooksModal from "./ExportBooksModal";

const BookPage = () => {
  const {
    close: closePrintablesModal,
    open: openPrintablesModal,
    isOpen: isPrintablesModalOpen,
  } = useSwitch();
  const [book, setBook] = useState<Book>({ ...BookInitialValue });
  const [totalPages, setTotalPages] = useState(1);
  const previewModal = useSwitch();
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
    tags: { type: "string", multiple: true, default: [] },
    mainC: { type: "string", multiple: true, default: [] },
    collections: { type: "number", multiple: true, default: [] },
    fromYearPublished: { type: "number", default: 1980 },
    toYearPublished: { type: "number", default: new Date().getFullYear() },
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
        collections: filterParams?.collections,
        mainC: filterParams?.mainC,
        fromYearPublished: filterParams?.fromYearPublished,
        toYearPublished: filterParams?.toYearPublished,
      },
    ],
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
  const { data: collections } = useCollections();

  const { data: tags } = useSearchTags({});
  const handleTagSelect = (
    values: MultiValue<{ label: string; value: string }>
  ) => {
    setFilterParams({
      tags: values.map((v) => v.value),
      page: 1,
    });
  };

  const handleCollectionSelect = (values: MultiValue<Section>) => {
    const main = [];
    const collections = [];
    for (const s of values) {
      if (s.isSubCollection) {
        collections.push(s.id);
      } else {
        main.push(s.accessionTable);
      }
    }
    setFilterParams({
      collections: [...collections],
      mainC: [...main],
      page: 1,
    });
  };
  const handleFrom = (date: Date) => {
    setFilterParams({
      fromYearPublished: date.getFullYear(),
      page: 1,
    });
  };
  const handleTo = (date: Date) => {
    setFilterParams({
      toYearPublished: date.getFullYear(),
      page: 1,
    });
  };
  const resetFilter = () => {
    setFilterParams({
      keyword: "",
      collections: [],
      mainC: [],
      page: 1,
      tags: [],
      fromYearPublished: 1980,
      toYearPublished: new Date().getFullYear(),
    });
  };
  const previewBook = (book: Book) => {
    setBook(book);
    previewModal.open();
  };
  const exportModal = useSwitch();
  return (
    <>
      <Container>
        <div className="p-2 flex justify-between ">
          <div className="flex gap-2 w-1/2">
            <form className="flex-1">
              <TextInput
                className="w-full"
                onChange={handleSearch}
                placeholder="Search books by title, subject, description or author"
                defaultValue={filterParams?.keyword}
              />
            </form>
            <Dropdown
              color="light"
              arrowIcon={false}
              className="py-2 p-3"
              label={<MdFilterList className="text-lg" />}
            >
              <div className="p-2 flex flex-col gap-2 w-96 ">
                <div className="flex flex-col gap-1">
                  <Label>Collection</Label>
                  <CustomSelect
                    onChange={handleCollectionSelect}
                    options={collections}
                    isMulti={true}
                    value={collections?.filter(
                      (c) =>
                        filterParams?.collections.includes(c.id) ||
                        filterParams?.mainC.includes(c.accessionTable)
                    )}
                    getOptionLabel={(opt) => opt.name}
                    getOptionValue={(opt) => opt.id?.toString() ?? ""}
                    placeholder="Select Collection"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Subject Tags</Label>
                  <CustomSelect
                    onChange={handleTagSelect}
                    value={filterParams?.tags.map((t: string) => ({
                      label: t,
                      value: t,
                    }))}
                    options={tags?.map((t) => ({ label: t, value: t }))}
                    getOptionLabel={(opt) => opt.label}
                    getOptionValue={(opt) => opt.value?.toString() ?? ""}
                    isMulti={true}
                    placeholder="Select Subject"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Year Published From</Label>
                  <CustomDatePicker
                    onChange={handleFrom}
                    selected={new Date(filterParams?.fromYearPublished, 0, 24)}
                    dateFormat="yyyy"
                    showYearPicker
                    yearItemNumber={9}
                  />
                  <Label>Year Published To</Label>
                  <CustomDatePicker
                    onChange={handleTo}
                    dateFormat="yyyy"
                    selected={new Date(filterParams?.toYearPublished, 0, 24)}
                    showYearPicker
                    value={filterParams?.toYearPublished}
                    yearItemNumber={9}
                  />
                </div>
                <Button color="primary" onClick={resetFilter}>
                  Reset Filter
                </Button>
              </div>
            </Dropdown>

            <HasAccess requiredPermissions={["Book.Edit"]}>
              {isSelectionsSameAccessionTable &&
                bookSelections.books.size > 0 && (
                  <Button onClick={migrate}>Migrate</Button>
                )}
            </HasAccess>
          </div>

          <div className="flex gap-2">
            <HasAccess requiredPermissions={["Book.Add"]}>
              <Button color="primary" to="/books/new" as={Link}>
                <AiOutlinePlus /> New Book
              </Button>
            </HasAccess>
            <HasAccess requiredPermissions={["Book.Add"]}>
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
            <HasAccess requiredPermissions={["Book.Read"]}>
              <Button onClick={exportModal.open} color="secondary">
                <MdOutlineDownload className="text-lg" />
                Export
              </Button>
            </HasAccess>
          </div>
        </div>
        <LoadingBoundaryV2 isLoading={isFetching} isError={isError}>
          <BookTable
            previewBook={previewBook}
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
      <PreviewModal
        book={book}
        closeModal={previewModal.close}
        isOpen={previewModal.isOpen}
      />
      <ExportBooksModal
        isOpen={exportModal.isOpen}
        closeModal={exportModal.close}
      />
    </>
  );
};

export default BookPage;
