import {
  Author,
  Organization,
  PersonAuthor,
  Publisher,
} from "@definitions/types";

import { IoIosRemoveCircleOutline } from "react-icons/io";
import { useBookAddFormContext } from "../BookAddFormContext";
import TableContainer from "@components/ui/table/TableContainer";
import { Table } from "flowbite-react";

const SelectedAuthorsTable = () => {
  const { form, setForm } = useBookAddFormContext();

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
          <Table.Body className="divide-y dark:divide-gray-700">
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
