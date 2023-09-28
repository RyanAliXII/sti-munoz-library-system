import {
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";

import { useQuery } from "@tanstack/react-query";
import { Author, PersonAuthor } from "@definitions/types";
import { useMemo } from "react";
import { useBookAddFormContext } from "../BookAddFormContext";
import { useRequest } from "@hooks/useRequest";

const AuthorSelection = () => {
  const { Get } = useRequest();
  const fetchAuthors = async () => {
    try {
      const { data: response } = await Get("/authors/");
      return response?.data?.authors ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };
  const { setForm, form } = useBookAddFormContext();

  const { data: authors } = useQuery<Author[]>({
    queryFn: fetchAuthors,
    queryKey: ["authors"],
  });
  const selectAuthor = (author: Author) => {
    setForm((prev) => ({ ...prev, authors: [...prev.authors, author] }));
  };
  const removeAuthor = (author: Author) => {
    setForm((prev) => ({
      ...prev,
      authors: prev.authors.filter((a) => a.id != author.id) ?? [],
    }));
  };
  const selectedCache = useMemo(
    () =>
      form.authors.reduce<Object>(
        (a, author) => ({
          ...a,
          [author.id ?? ""]: author,
        }),
        {}
      ),
    [form.authors]
  );
  return (
    <Table className="w-full border-b-0">
      <Thead>
        <HeadingRow>
          <Th></Th>
          <Th>Name</Th>
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
              <Td>{author.name}</Td>
            </BodyRow>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default AuthorSelection;
