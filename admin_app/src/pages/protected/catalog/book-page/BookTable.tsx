import HasAccess from "@components/auth/HasAccess";
import { Book } from "@definitions/types";
import Tippy from "@tippyjs/react";
import { Button, Checkbox, Table } from "flowbite-react";
import { ChangeEvent, FC } from "react";
import { AiOutlineEdit, AiOutlinePrinter } from "react-icons/ai";
import { Link } from "react-router-dom";

type BookTableProps = {
  books: Book[];
  bookSelections: {
    books: Map<string, Book>;
  };
  onSelect: (event: ChangeEvent<HTMLInputElement>, book: Book) => void;
  setBookForPrintingAndOpenModal: (book: Book) => void;
};
const BookTable: FC<BookTableProps> = ({
  books,
  bookSelections,
  onSelect,
  setBookForPrintingAndOpenModal,
}) => {
  return (
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
      </div>
    </div>
  );
};

export default BookTable;
