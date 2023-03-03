import {
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import axiosClient from "@definitions/configs/axios";
import { useQuery } from "@tanstack/react-query";
import { PersonAuthor } from "@definitions/types";
import { useMemo } from "react";
import { useBookEditFormContext } from "../BookEditFormContext";

const PersonAsAuthorSelection = () => {
  const fetchAuthors = async () => {
    try {
      const { data: response } = await axiosClient.get("/authors/");
      return response?.data?.authors ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const { setForm, form } = useBookEditFormContext();

  const { data: authors } = useQuery<PersonAuthor[]>({
    queryFn: fetchAuthors,
    queryKey: ["authors"],
  });
  const selectAuthor = (author: PersonAuthor) => {
    setForm((prev) => ({
      ...prev,
      authors: { ...prev.authors, people: [...prev.authors.people, author] },
    }));
  };
  const removeAuthor = (author: PersonAuthor) => {
    setForm((prev) => ({
      ...prev,
      authors: {
        ...prev.authors,
        people: prev.authors.people.filter((person) => person.id != author.id),
      },
    }));
  };
  const selectedCache = useMemo(
    () =>
      form.authors.people.reduce<Object>(
        (a, author) => ({
          ...a,
          [author.id ?? ""]: author,
        }),
        {}
      ),
    [form.authors.people]
  );
  return (
    <Table className="w-full border-b-0">
      <Thead>
        <HeadingRow>
          <Th></Th>
          <Th>Given name</Th>
          <Th>Middle name/initial</Th>
          <Th>Surname</Th>
        </HeadingRow>
      </Thead>
      <Tbody>
        {authors?.map((author) => {
          const isChecked = author.id
            ? selectedCache.hasOwnProperty(author.id)
            : false;
          return (
            <BodyRow
              key={author.id}
              className="cursor-pointer"
              onClick={() => {
                if (!isChecked) {
                  selectAuthor(author);
                  return;
                }
                removeAuthor(author);
              }}
            >
              <Td>
                <input
                  type="checkbox"
                  readOnly
                  checked={isChecked}
                  className="h-4 w-4 border"
                />
              </Td>
              <Td>{author.givenName}</Td>
              <Td>{author.middleName}</Td>
              <Td>{author.surname}</Td>
            </BodyRow>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default PersonAsAuthorSelection;
