import { Account } from "@definitions/types";
import { Avatar, Table } from "flowbite-react";
import React from "react";

type AccountTableProps = {
  accounts: Account[];
};
const AccountTable: React.FC<AccountTableProps> = ({ accounts }) => {
  return (
    <Table>
      <Table.Head>
        <Table.HeadCell></Table.HeadCell>
        <Table.HeadCell>User</Table.HeadCell>
        <Table.HeadCell>Email</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y dark:divide-gray-700">
        {accounts?.map((account) => {
          const url = new URL(
            "https://ui-avatars.com/api/&background=2563EB&color=fff"
          );
          url.searchParams.set(
            "name",
            `${account.givenName} ${account.surname}`
          );
          return (
            <Table.Row key={account.id}>
              <Table.Cell>
                <div className="h-10">
                  <Avatar img={url.toString()} rounded></Avatar>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {account.givenName.length + account.surname.length === 0
                    ? "Unnamed"
                    : `${account.givenName} ${account.surname}`}
                </div>
                <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {account.displayName}
                </div>
              </Table.Cell>
              <Table.Cell>{account.email}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default AccountTable;
