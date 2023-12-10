import { Account } from "@definitions/types";

export type AccountIdSelectionPayload = {
  single?: Account;
  multiple?: Account[];
};
export type SelectedAccountIdsAction = {
  type:
    | "select"
    | "unselect"
    | "unselect-all"
    | "select-all-page"
    | "unselect-all-page";
  payload: AccountIdSelectionPayload;
};
export const selectedAccountIdsReducer = (
  state: Map<string, Account>,
  action: SelectedAccountIdsAction
) => {
  const { type, payload } = action;
  payload.multiple = payload.multiple ?? [];
  payload.single = payload.single;

  if (payload.single && action.type === "select") {
    const accountMap = new Map(state);
    accountMap.set(payload.single.id ?? "", payload.single);
    return accountMap;
  }

  if (payload.single && action.type === "unselect") {
    const accountMap = new Map(state);
    accountMap.delete(payload.single?.id ?? "");
    return accountMap;
  }
  if (payload.multiple && action.type === "select-all-page") {
    const accountMap = new Map(state);
    payload.multiple.forEach((a) => {
      accountMap.set(a.id ?? "", a);
    });
    return accountMap;
  }

  if (payload.multiple && action.type === "unselect-all-page") {
    const accountMap = new Map(state);
    payload.multiple.forEach((a) => {
      accountMap.delete(a.id ?? "");
    });
    return accountMap;
  }

  if (action.type === "unselect-all") return new Map<string, Account>();

  return state;
};
