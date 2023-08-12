import { Publisher } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { useMemo } from "react";
import { useBookAddFormContext } from "../BookAddFormContext";
import { useRequest } from "@hooks/useRequest";
const PublisherSelection = () => {
  const { setForm, form } = useBookAddFormContext();
  const { Get } = useRequest();
  const fetchPublisher = async () => {
    try {
      const { data: response } = await Get("/publishers/");
      return response?.data?.publishers || [];
    } catch (error) {
      console.error(error);
      toast.error(ErrorMsg.Get);
    }
    return [];
  };
  const { data: publishers } = useQuery<Publisher[]>({
    queryFn: fetchPublisher,
    queryKey: ["publishers"],
  });
  const selectAuthor = (author: Publisher) => {
    setForm((prevForm) => ({
      ...prevForm,
      authors: {
        ...prevForm.authors,
        publishers: [...prevForm.authors.publishers, author],
      },
    }));
  };
  const removeAuthor = (author: Publisher) => {
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
  const selectedCache = useMemo(
    () =>
      form.authors.publishers.reduce<Object>(
        (a, author) => ({
          ...a,
          [author.id ?? ""]: author,
        }),
        {}
      ),
    [form.authors.publishers]
  );

  return (
    <Table className="w-full border-b-0">
      <Thead>
        <HeadingRow>
          <Th>Publisher</Th>
        </HeadingRow>
      </Thead>
      <Tbody>
        {publishers?.map((publisher) => {
          const isChecked = publisher.id
            ? selectedCache.hasOwnProperty(publisher.id)
            : false;

          return (
            <BodyRow
              key={publisher.id}
              className="cursor-pointer"
              onClick={() => {
                if (!isChecked) {
                  selectAuthor(publisher);
                  return;
                }
                removeAuthor(publisher);
              }}
            >
              <Td className="flex items-center gap-10">
                <input
                  type="checkbox"
                  readOnly
                  checked={isChecked}
                  className="h-4 w-4 border"
                />
                {publisher.name}
              </Td>
            </BodyRow>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default PublisherSelection;