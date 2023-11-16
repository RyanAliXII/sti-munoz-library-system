export type AccountIdSelectionPayload = {
  single?: string;
  multiple?: string[];
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
  state: Set<string>,
  action: SelectedAccountIdsAction
) => {
  const { type, payload } = action;
  payload.multiple = payload.multiple ?? [];
  payload.single = payload.single ?? "";
  switch (type) {
    case "select":
      return new Set([...state, payload.single]);
    case "unselect":
      state.delete(payload.single);
      return new Set([...state]);
    case "unselect-all":
      return new Set([]);
    case "select-all-page":
      return new Set([...state, ...payload.multiple]);
    case "unselect-all-page":
      const filteredSet = [...state].filter(
        (id) => !payload.multiple?.includes(id)
      );
      return new Set(filteredSet);
    default:
      return state;
  }
};
