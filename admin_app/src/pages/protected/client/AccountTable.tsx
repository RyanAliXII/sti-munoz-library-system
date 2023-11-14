import { Account } from "@definitions/types";
import { Avatar, Checkbox, Table } from "flowbite-react";
import React, { ChangeEvent, Dispatch, useMemo } from "react";
import { SelectedAccountIdsAction } from "./selected-account-ids-reducer";

type AccountTableProps = {
  accounts: Account[];
  selectedAccountIds: Set<string>;
  dispatchSelection: Dispatch<SelectedAccountIdsAction>;
};
const AccountTable: React.FC<AccountTableProps> = ({
  accounts,
  selectedAccountIds,
  dispatchSelection,
}) => {
  const selectedAccountIdsCache = useMemo<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const accountId of selectedAccountIds) {
      map.set(accountId, accountId);
    }

    return map;
  }, [selectedAccountIds]);

  const handleAccountSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    const accountId = event.target.value;
    if (isChecked) {
      dispatchSelection({
        payload: { single: accountId },
        type: "select",
      });
      return;
    }
    dispatchSelection({
      payload: { single: accountId },
      type: "unselect",
    });
  };
  const selectedText =
    selectedAccountIds.size > 0 ? `${selectedAccountIds.size} selected` : "";
  const selectAll = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    const accountIds = accounts.map((account) => account.id ?? "");
    if (checked) {
      dispatchSelection({
        type: "select-all-page",
        payload: { multiple: accountIds ?? [] },
      });
      return;
    }
    dispatchSelection({
      type: "unselect-all-page",
      payload: {
        multiple: accountIds,
      },
    });
    return;
  };
  const isSelectAllChecked = useMemo(
    () =>
      accounts.every((account) =>
        selectedAccountIdsCache.has(account.id ?? "")
      ),
    [accounts, selectedAccountIds]
  );
  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>
          <div className="flex items-center gap-2">
            <Checkbox
              color="primary"
              onChange={selectAll}
              checked={isSelectAllChecked}
            />

            {selectedText}
            <a className="underline"></a>
          </div>
        </Table.HeadCell>
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
          const isChecked = selectedAccountIdsCache.has(account.id ?? "");
          const name =
            account.givenName.length + account.surname.length === 0
              ? "Unnamed"
              : `${account.givenName} ${account.surname}`;
          return (
            <Table.Row key={account.id}>
              <Table.Cell>
                <Checkbox
                  checked={isChecked}
                  color="primary"
                  onChange={handleAccountSelect}
                  value={account.id}
                ></Checkbox>
              </Table.Cell>
              <Table.Cell>
                <div className="h-10">
                  <Avatar img={url.toString()} rounded></Avatar>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {name}
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
