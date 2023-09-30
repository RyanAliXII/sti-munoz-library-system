import { Author } from "@definitions/types";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import { IoIosRemoveCircleOutline } from "react-icons/io";
import { useBookEditFormContext } from "../BookEditFormContext";

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
      <Table className="w-full">
        <Thead className=" sticky top-0">
          <HeadingRow>
            <Th>Author</Th>
            <Th></Th>
          </HeadingRow>
        </Thead>
        <Tbody>
          {form.authors.map((author) => {
            return (
              <BodyRow key={author.id}>
                <Td>{author.name}</Td>
                <Td className="p-2 flex gap-2 items-center justify-center h-full">
                  <IoIosRemoveCircleOutline
                    className="cursor-pointer text-orange-600  text-xl"
                    onClick={() => {
                      removeAuthor(author);
                    }}
                  />
                </Td>
              </BodyRow>
            );
          })}
        </Tbody>
      </Table>
    </>
  );
};

export default SelectedAuthorsTable;
