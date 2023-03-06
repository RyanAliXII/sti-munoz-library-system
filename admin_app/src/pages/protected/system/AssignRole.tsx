import React, { useState } from "react";

import { Account, Role } from "@definitions/types";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import ClientSearchBox from "@components/client-search-box/ClientSearchBox";
import { useForm } from "@hooks/useForm";
import CustomSelect from "@components/ui/form/CustomSelect";
import { useQuery } from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import { option } from "io-ts-types";

type AssignForm = {
  account: Account;
  role: Role;
};
const AssignRolePage = () => {
  const [form, setForm] = useState<AssignForm[]>([]);
  const handleSelect = (account: Account) => {
    setForm((prevData) => [
      ...prevData,
      {
        account: account,
        role: {
          name: "",
          permissions: {},
        },
      },
    ]);
  };
  const { Get } = useRequest();
  const fetchRoles = async () => {
    try {
      const { data: response } = await Get("/system/roles");
      return response?.data?.roles ?? [];
    } catch {
      return [];
    }
  };
  const { data: roles } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });
  const {} = useQuery({
    queryKey: ["roles"],
  });

  return (
    <>
      <ContainerNoBackground>
        <ClientSearchBox
          setClient={handleSelect}
          label="Search Accounts"
          placeholder="Enter account given name, surname or email"
        ></ClientSearchBox>
      </ContainerNoBackground>
      <Container>
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Selected Account</Th>
              <Th>Role</Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {form.map((d, index) => {
              return (
                <BodyRow key={d.account.id}>
                  <Td>{d.account.displayName}</Td>
                  <Td style={{ maxWidth: "100px" }}>
                    <CustomSelect
                      //   value={form[index].role}
                      //   onChange={(value) => {
                      //     form[index] = {
                      //       ...form[index],
                      //       role: value as Role,
                      //     };
                      //   }}
                      options={roles}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id?.toString() ?? ""}
                    ></CustomSelect>
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
      </Container>
    </>
  );
};

export default AssignRolePage;
