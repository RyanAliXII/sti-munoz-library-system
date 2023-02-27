import { Organization, PersonAuthor, Publisher } from "@definitions/types";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import { useBookAddFormContext } from "../../book-add/BookAddFormContext";
import { IoIosRemoveCircleOutline } from "react-icons/io";

const SelectedAuthorsTable = () => {
  const { form, setForm } = useBookAddFormContext();

  const removePersonAsAuthor = (author: PersonAuthor) => {
    setForm((prev) => ({
      ...prev,
      authors: {
        ...prev.authors,
        people: prev.authors.people.filter((person) => person.id != author.id),
      },
    }));
  };
  const removeOrgAsAuthor = (author: Organization) => {
    setForm((prevForm) => ({
      ...prevForm,
      authors: {
        ...prevForm.authors,
        organizations: prevForm.authors.organizations.filter(
          (org) => org.id != author.id
        ),
      },
    }));
  };

  const removePublisherAsAuthor = (author: Publisher) => {
    setForm((prevForm) => ({
      ...prevForm,
      authors: {
        ...prevForm.authors,
        publishers: prevForm.authors.publishers.filter(
          (publisher) => publisher.id != author.id
        ),
      },
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
          {form.authors.people.map((author) => {
            return (
              <BodyRow key={author.id}>
                <Td>
                  {author.givenName} {author.middleName} {author.surname}
                </Td>
                <Td className="p-2 flex gap-2 items-center justify-center h-full">
                  <IoIosRemoveCircleOutline
                    className="cursor-pointer text-orange-600  text-xl"
                    onClick={() => {
                      removePersonAsAuthor(author);
                    }}
                  />
                </Td>
              </BodyRow>
            );
          })}
          {form.authors.organizations.map((author) => {
            return (
              <BodyRow key={author.id}>
                <Td>{author.name}</Td>
                <Td className="p-2 flex gap-2 items-center justify-center h-full">
                  <IoIosRemoveCircleOutline
                    className="cursor-pointer text-orange-600  text-xl"
                    onClick={() => {
                      removeOrgAsAuthor(author);
                    }}
                  />
                </Td>
              </BodyRow>
            );
          })}
          {form.authors.publishers.map((author) => {
            return (
              <BodyRow key={author.id}>
                <Td>{author.name}</Td>
                <Td className="p-2 flex gap-2 items-center justify-center h-full">
                  <IoIosRemoveCircleOutline
                    className="cursor-pointer text-orange-600  text-xl"
                    onClick={() => {
                      removePublisherAsAuthor(author);
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
