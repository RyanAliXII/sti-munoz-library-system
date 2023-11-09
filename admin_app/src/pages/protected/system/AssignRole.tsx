import { useState } from "react";

import Container from "@components/ui/container/Container";

import { Account, Role } from "@definitions/types";

import ClientSearchBox from "@components/ClientSearchBox";
import CustomSelect from "@components/ui/form/CustomSelect";
import { ErrorMsg } from "@definitions/var";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Table } from "flowbite-react";
import { IoIosRemoveCircleOutline } from "react-icons/io";
import { SingleValue } from "react-select";
import { toast } from "react-toastify";
import { AssignRoleFormSchemaValidation } from "./schema";

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
      <Container>
        <div className="py-4">
          <ClientSearchBox className="w-full" setClient={handleAccountSelect} />
        </div>
        <Table>
          <Table.Head>
            <Table.HeadCell>Selected Account</Table.HeadCell>
            <Table.HeadCell>Role</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y divide-gray-700">
            {form.map((d, index) => {
              return (
                <Table.Row key={d.account.id}>
                  <Table.Cell>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {d.account.givenName} {d.account.surname}
                    </div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {d.account.email}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <CustomSelect
                      value={form[index].role}
                      onChange={(value) => {
                        handleRoleSelection(index, value);
                      }}
                      options={roles}
                      getOptionLabel={(option) => option.name}
                      getOptionValue={(option) => option.id?.toString() ?? ""}
                    ></CustomSelect>
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      color="failure"
                      onClick={() => {
                        removeRow(d.account);
                      }}
                    >
                      <IoIosRemoveCircleOutline className="cursor-pointer text-2xl" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        {form.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-gray-500 dark:text-gray-100">
            <small>No accounts selected.</small>
          </div>
        ) : null}
        <div className="flex justify-end py-4">
          <Button color="primary" onClick={submit} disabled={form.length === 0}>
            Assign role
          </Button>
        </div>
      </Container>
    </>
  );
};

export default AssignRolePage;
