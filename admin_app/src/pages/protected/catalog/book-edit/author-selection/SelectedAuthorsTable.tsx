import { Author } from "@definitions/types";

import { IoIosRemoveCircleOutline } from "react-icons/io";
import { useBookEditFormContext } from "../BookEditFormContext";
import { Table } from "flowbite-react";
import TableContainer from "@components/ui/table/TableContainer";

const SelectedAuthorsTable = () => {
  const { form, setForm } = useBookEditFormContext();

  const removeAuthor = (author: Author) => {
    setForm((prev) => ({
      ...prev,
      authors: prev.authors.filter((a) => a.id != author.id),
    }));
  };

  return (
    <>
      <TableContainer>
        <Table className="w-full">
          <Table.Head className=" sticky top-0">
            <Table.HeadCell>Author</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {form.authors.map((author) => {
              return (
                <Table.Row key={author.id}>
                  <Table.Cell>
                    <div className="text-gray-900 font-semibold dark:text-white">
                      {author.name}
                    </div>
                  </Table.Cell>
                  <Table.Cell className="p-2 flex gap-2 items-center justify-center h-full">
                    <IoIosRemoveCircleOutline
                      className="cursor-pointer text-orange-600  text-xl"
                      onClick={() => {
                        removeAuthor(author);
                      }}
                    />
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
    </>
  );
};

export default SelectedAuthorsTable;
