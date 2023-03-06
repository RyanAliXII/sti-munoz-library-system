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
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import { option } from "io-ts-types";
import { SingleValue } from "react-select";
import { PrimaryButton } from "@components/ui/button/Button";
import { AssignRoleFormSchemaValidation } from "./schema";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";

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
  const handleRoleSelection = (index: number, role: SingleValue<Role>) => {
    const newData = [...form];
    newData[index] = {
      ...form[index],
      account: {
        ...form[index].account,
      },
      role: { ...(role as Role) },
    };
    setForm(newData);
  };
  const submit = async () => {
    try {
      const data: unknown = await AssignRoleFormSchemaValidation.validate(form);
      assignRole.mutate(data as AssignForm);
    } catch (error) {
      toast.error(
        "Role cannot be empty. Please assign a role to user accounts."
      );
      console.log(error);
    }
  };
  const { Post } = useRequest();
  const assignRole = useMutation({
    mutationKey: ["roles"],
    mutationFn: (formData: AssignForm) =>
      Post("/system/roles/accounts", formData),
    onSuccess: (response) => {
      console.log(response);
      toast.success("Roles has been assigned successfully.");
    },
    onError: () => {
      toast.error(ErrorMsg.New);
    },
    onSettled: () => {
      setForm([]);
    },
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
                      value={form[index].role}
                      onChange={(value) => {
                        handleRoleSelection(index, value);
                      }}
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
      <ContainerNoBackground>
        <PrimaryButton onClick={submit} disabled={form.length === 0}>
          Assign role
        </PrimaryButton>
      </ContainerNoBackground>
    </>
  );
};

export default AssignRolePage;
