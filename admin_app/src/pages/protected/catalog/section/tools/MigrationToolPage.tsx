import BookSearchBox from "@components/BookSearchBox";
import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { Book } from "@definitions/types";
import { Button, Label, Select, Table } from "flowbite-react";
import { useReducer } from "react";
import { MigrationData, migrationReducer } from "./migration-reducer";
import { FaSave, FaTimes } from "react-icons/fa";
import { useCollections } from "@hooks/data-fetching/collection";
import { useForm } from "@hooks/useForm";

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
  const { form, handleFormInput } = useForm<{
    collectionId: string;
    bookIds: string[];
  }>({
    initialFormData: {
      collectionId: "",
      bookIds: [],
    },
  });
  return (
    <Container>
      <form>
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
            <option value="" disabled>
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
          </TableContainer>
        </div>
        <Button
          type="submit"
          color="primary"
          disabled={form.collectionId.length === 0 || form.bookIds.length === 0}
        >
          <div className="flex gap-1 items-center">
            <FaSave />
            Save
          </div>
        </Button>
      </form>
    </Container>
  );
};

export default MigrationToolPage;
