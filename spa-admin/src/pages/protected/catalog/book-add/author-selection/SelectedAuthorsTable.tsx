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
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

import { useBookAddFormContext } from "../BookAddFormContext";
import { IoIosRemoveCircleOutline } from "react-icons/io";

interface SelectedAuthorsTableProps {
  removeAuthor: (a: Author) => void;
}
const SelectedAuthorsTable: React.FC<SelectedAuthorsTableProps> = ({
  removeAuthor,
}) => {
  const { form } = useBookAddFormContext();
  return (
    <>
      <Table className="w-full">
        <Thead className=" sticky top-0">
          <HeadingRow>
            <Th>Given name</Th>
            <Th>Middle name/initial</Th>
            <Th>Surname</Th>
            <Th></Th>
          </HeadingRow>
        </Thead>
        <Tbody>
          {form.authors.map((author) => {
            return (
              <BodyRow key={author.id}>
                <Td>{author.givenName}</Td>
                <Td>{author.middleName}</Td>
                <Td>{author.surname}</Td>
                <Td className="p-2 flex gap-2 items-center justify-center h-full">
                  {!author.id && (
                    <AiOutlineEdit className="cursor-pointer text-yellow-400 text-xl" />
                  )}
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
