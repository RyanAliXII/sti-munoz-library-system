import { Account } from "@definitions/types";
import { Avatar, Badge, Button, Checkbox, Table } from "flowbite-react";
import React, { ChangeEvent, Dispatch, useMemo } from "react";
import { SelectedAccountIdsAction } from "./selected-account-ids-reducer";
import { buildAvatar } from "@helpers/avatar";

type AccountTableProps = {
  accounts: Account[];
  selectedAccountIds: Map<string, Account>;
  dispatchSelection: Dispatch<SelectedAccountIdsAction>;
  initActivate: (account: Account) => void;
  initDeactivate: (account: Account) => void;
};
const AccountTable: React.FC<AccountTableProps> = ({
  accounts,
  selectedAccountIds,
  dispatchSelection,
  initActivate,
  initDeactivate,
}) => {
  const selectedAccountIdsCache = useMemo<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const [key, value] of selectedAccountIds) {
      map.set(key, key);
    }

    return map;
  }, [selectedAccountIds]);

  const handleAccountSelect = (account: Account) => {
    dispatchSelection({
      payload: { single: account },
      type: "select",
    });
    return;
  };
  const handleAccountDeselect = (account: Account) => {
    dispatchSelection({
      payload: { single: account },
      type: "unselect",
    });
  };
  const selectedText =
    selectedAccountIds.size > 0 ? `${selectedAccountIds.size} selected` : "";
  const selectAll = (event: ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    if (isChecked) {
      dispatchSelection({
        payload: { multiple: accounts },
        type: "select-all-page",
      });
      return;
    } else {
      dispatchSelection({
        payload: { multiple: accounts },
        type: "unselect-all-page",
      });
      return;
    }
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
        <Table.HeadCell>User Group</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
        <Table.HeadCell>Status</Table.HeadCell>
      </Table.Head>
      <Table.Body className="divide-y dark:divide-gray-700">
        {accounts?.map((account) => {
          const isChecked = selectedAccountIds.has(account.id ?? "");
          const avatarUrl = buildAvatar(account);
          return (
            <Table.Row key={account.id}>
              <Table.Cell>
                <Checkbox
                  checked={isChecked}
                  color="primary"
                  onChange={() => {
                    if (!isChecked) {
                      handleAccountSelect(account);
                      return;
                    }
                    handleAccountDeselect(account);
                  }}
                  value={account.id}
                ></Checkbox>
              </Table.Cell>
              <Table.Cell>
                <div className="h-10">
                  <Avatar img={avatarUrl} rounded></Avatar>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {account.givenName} {account.surname}
                </div>
                <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {account.displayName}
                </div>
              </Table.Cell>
              <Table.Cell>{account.email}</Table.Cell>
              <Table.Cell>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {account.userType}
                </div>
                <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {account.programCode}
                </div>
              </Table.Cell>
              <Table.Cell>
                <StatusBadge account={account}></StatusBadge>
              </Table.Cell>
              <Table.Cell>
                {!account.isActive && (
                  <Button
                    color="success"
                    onClick={() => {
                      initActivate(account);
                    }}
                  >
                    Enable
                  </Button>
                )}
                {account.isActive && (
                  <Button
                    color="warning"
                    onClick={() => {
                      initDeactivate(account);
                    }}
                  >
                    Disable
                  </Button>
                )}
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

const StatusBadge = ({ account }: { account: Account }) => {
  if (account.isDeleted) {
    return (
      <div className="flex flex-wrap gap-2">
        <Badge color="failure">Deleted</Badge>
      </div>
    );
  }
  if (account.isActive)
    return (
      <div className="flex flex-wrap gap-2">
        <Badge color="success">Active</Badge>
      </div>
    );
  return (
    <div className="flex flex-wrap gap-2">
      <Badge color="warning">Disabled</Badge>
    </div>
  );
};

export default AccountTable;
