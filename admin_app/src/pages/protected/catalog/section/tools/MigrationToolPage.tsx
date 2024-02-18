import BookSearchBox from "@components/BookSearchBox";
import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { Book } from "@definitions/types";
import { Button, Label, Select, Table } from "flowbite-react";
import { FormEvent, useReducer } from "react";
import { MigrationData, migrationReducer } from "./migration-reducer";
import { FaSave, FaTimes } from "react-icons/fa";
import { useCollections } from "@hooks/data-fetching/collection";
import { useForm } from "@hooks/useForm";
import { useSwitch } from "@hooks/useToggle";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { useMigrateCollection } from "@hooks/data-fetching/book";
import { toast } from "react-toastify";
import { number, object } from "yup";

const MigrationToolPage = () => {
  const [migrationData, dispatchMigrateAction] = useReducer(migrationReducer, {
    books: [],
    cache: new Set<string>(),
  });
  const onSelectBook = (book: Book) => {
    if (migrationData.cache.has(book.id ?? "")) return;
    dispatchMigrateAction({
      type: "Add",
      payload: {
        book: book,
      },
    });
  };
  const onRemoveBook = (book: Book) => {
    dispatchMigrateAction({
      type: "Remove",
      payload: {
        book: book,
      },
    });
  };
  const { data: collections } = useCollections();
  const { form, handleFormInput, resetForm, validate } = useForm<{
    collectionId: number;
  }>({
    initialFormData: {
      collectionId: 0,
    },
    schema: object({
      collectionId: number().required().min(1),
    }),
  });
  const confirmMigration = useSwitch();
  const migrateCollection = useMigrateCollection({
    onSuccess: () => {
      resetForm();
      dispatchMigrateAction({ type: "Clear", payload: {} });
      toast.success("Books migrated to another collection.");
    },
  });

  const onConfirmMigrate = async () => {
    try {
      const validatedForm = await validate();
      if (migrationData.books.length === 0 || !validatedForm) return;
      confirmMigration.close();
      migrateCollection.mutate({
        sectionId: validatedForm.collectionId,
        bookIds: migrationData.books.map((book) => book.id ?? ""),
      });
    } catch (error) {
      console.error(error);
    }
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    confirmMigration.open();
  };
  return (
    <Container>
      <div className="py-4">
        <h4 className="text-2xl">Migration Tool</h4>
      </div>
      <form onSubmit={onSubmit}>
        <BookSearchBox
          label="Search books to migrate"
          selectBook={onSelectBook}
        />
        <div className="py-2">
          <Label>Select Collection</Label>
          <Select
            name="collectionId"
            value={form.collectionId}
            onChange={handleFormInput}
          >
            <option value="0" disabled>
              No collection selected
            </option>
            {collections?.map((c) => {
              return (
                <option value={c.id} key={c.id}>
                  {c.name}
                </option>
              );
            })}
          </Select>
        </div>
        <div className="py-2">
          <TableContainer>
            <Table>
              <Table.Head>
                <Table.HeadCell>Title</Table.HeadCell>
                <Table.HeadCell>Collection</Table.HeadCell>
                <Table.HeadCell>Authors</Table.HeadCell>
                <Table.HeadCell></Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {migrationData.books.map((book) => {
                  return (
                    <Table.Row key={book.id}>
                      <Table.Cell>{book.title}</Table.Cell>
                      <Table.Cell>{book.section.name}</Table.Cell>
                      <Table.Cell>
                        {book.authors.map((a) => a.name).join(", ")}
                      </Table.Cell>
                      <Table.Cell>
                        <Button
                          color="failure"
                          onClick={() => {
                            onRemoveBook(book);
                          }}
                        >
                          <FaTimes />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
            {migrationData.books.length === 0 && (
              <div className="w-full flex items-center justify-center h-40">
                <p>No book selected</p>
              </div>
            )}
          </TableContainer>
        </div>
        <Button
          type="submit"
          color="primary"
          disabled={form.collectionId == 0 || migrationData.books.length === 0}
        >
          <div className="flex gap-1 items-center">
            <FaSave />
            Migrate to Selected Collection
          </div>
        </Button>
      </form>
      <DangerConfirmDialog
        close={confirmMigration.close}
        isOpen={confirmMigration.isOpen}
        title="Book Migration to Another Collection"
        onConfirm={onConfirmMigrate}
        text="Are you sure you want to migrate selected books? This action may cause book copies to generate new accession number."
      />
    </Container>
  );
};

export default MigrationToolPage;
