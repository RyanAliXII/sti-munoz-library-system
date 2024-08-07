import HasAccess from "@components/auth/HasAccess";
import { Book } from "@definitions/types";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { ChangeEvent, FC } from "react";
import { AiOutlineEdit, AiOutlineEye, AiOutlinePrinter } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

type BookTableProps = {
  books: Book[];
  bookSelections: {
    books: Map<string, Book>;
  };
  onSelect: (event: ChangeEvent<HTMLInputElement>, book: Book) => void;
  setBookForPrintingAndOpenModal: (book: Book) => void;
  previewBook: (book: Book) => void;
  initDelete: (book: Book) => void;
};
const BookTable: FC<BookTableProps> = ({
  books,
  bookSelections,
  onSelect,
  previewBook,
  setBookForPrintingAndOpenModal,
  initDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <Table.Head>
            {/* <Table.HeadCell></Table.HeadCell> */}
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
                  {/* <Table.Cell>
                    <Checkbox
                      color="primary"
                      checked={bookSelections.books.has(book?.id ?? "")}
                      onChange={(event) => {
                        onSelect(event, book);
                      }}
                    />
                  </Table.Cell> */}

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

                    <Tippy content="Preview">
                      <Button
                        color="primary"
                        outline
                        onClick={() => {
                          previewBook(book);
                        }}
                      >
                        <AiOutlineEye className="text-lg cursor-pointer " />
                      </Button>
                    </Tippy>
                    <HasAccess requiredPermissions={["Book.Edit"]}>
                      <Tippy content="Edit Resource">
                        <Button
                          as={Link}
                          color="secondary"
                          to={`/resources/edit/${book.id}`}
                        >
                          <AiOutlineEdit className="text-lg cursor-pointer" />
                        </Button>
                      </Tippy>
                    </HasAccess>
                    <HasAccess requiredPermissions={["Book.Delete"]}>
                      <Tippy content="Delete Resource">
                        <Button
                          color="failure"
                          onClick={() => {
                            initDelete(book);
                          }}
                        >
                          <FaTrash />
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
