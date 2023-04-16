import { useQuery } from "@tanstack/react-query";
import {
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { Organization } from "@definitions/types";

import { useMemo } from "react";
import { useBookAddFormContext } from "../BookAddFormContext";
import { useRequest } from "@hooks/useRequest";

const OrganizationSelection = () => {
  const { setForm, form } = useBookAddFormContext();
  const { Get } = useRequest();
  const fetchOrganizations = async () => {
    try {
      const { data: response } = await Get("/authors/organizations");

      return response?.data?.organizations || [];
    } catch {
      return [];
    }
  };
  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
  });
  const selectAuthor = (author: Organization) => {
    setForm((prevForm) => ({
      ...prevForm,
      authors: {
        ...prevForm.authors,
        organizations: [...prevForm.authors.organizations, author],
      },
    }));
  };
  const removeAuthor = (author: Organization) => {
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

  const selectedCache = useMemo(
    () =>
      form.authors.organizations.reduce<Object>(
        (a, author) => ({
          ...a,
          [author.id ?? ""]: author,
        }),
        {}
      ),
    [form.authors.organizations]
  );
  return (
    <Table className="w-full border-b-0">
      <Thead>
        <HeadingRow>
          <Th>Organization</Th>
        </HeadingRow>
      </Thead>
      <Tbody>
        {organizations?.map((org) => {
          const isChecked = org.id
            ? selectedCache.hasOwnProperty(org.id)
            : false;
          return (
            <BodyRow
              key={org.id}
              className="cursor-pointer"
              onClick={() => {
                if (!isChecked) {
                  selectAuthor(org);
                  return;
                }
                removeAuthor(org);
              }}
            >
              <Td className="flex gap-10 items-center">
                <input
                  type="checkbox"
                  readOnly
                  className="h-4 w-4 border"
                  checked={isChecked}
                />
                {org.name}
              </Td>
            </BodyRow>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default OrganizationSelection;
