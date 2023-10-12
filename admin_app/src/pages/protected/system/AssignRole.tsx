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
import AccountSearchBox from "@components/account-search/AccountSearchBox";

import CustomSelect from "@components/ui/form/CustomSelect";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRequest } from "@hooks/useRequest";
import { SingleValue } from "react-select";
import { PrimaryButton } from "@components/ui/button/Button";
import { AssignRoleFormSchemaValidation } from "./schema";
import { toast } from "react-toastify";
import { ErrorMsg } from "@definitions/var";
import { IoIosRemoveCircleOutline } from "react-icons/io";

type AssignForm = {
  account: Account;
  role: Role;
};
const AssignRolePage = () => {
  const [form, setForm] = useState<AssignForm[]>([]);
  const handleAccountSelect = (account: Account) => {
    setForm((prevData) => [
      ...prevData,
      {
        account: account,
        role: {
          name: "",
          permissions: [],
        },
      },
    ]);
  };
  const { Get, Post } = useRequest();
  const fetchRoles = async () => {
    try {
      const { data: response } = await Get("/system/roles", {}, []);
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

  const assignRole = useMutation({
    mutationKey: ["roles"],
    mutationFn: (formData: AssignForm) =>
      Post("/system/roles/accounts", formData, {}, []),
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
  const removeRow = (account: Account) => {
    setForm(form.filter((r) => r.account.id != account.id));
  };
  return (
    <>
      <ContainerNoBackground>
        <AccountSearchBox
          setClient={handleAccountSelect}
          label="Search Accounts"
          placeholder="Enter account given name, surname or email"
        ></AccountSearchBox>
      </ContainerNoBackground>
      <Container>
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Selected Account</Th>
              <Th>Role</Th>
              <Th></Th>
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
                  <Td>
                    <Td
                      style={{
                        minWidth: "50px",
                      }}
                      className="flex justify-center"
                    >
                      <IoIosRemoveCircleOutline
                        className="text-red-400 cursor-pointer text-2xl"
                        onClick={() => {
                          removeRow(d.account);
                        }}
                      />
                    </Td>
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
        {form.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-gray-500">
            <small>No accounts selected.</small>
          </div>
        ) : null}
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
