export type AccountIdSelectionPayload = {
  single?: string;
  multiple?: string[];
};
export type SelectedAccountIdsAction = {
  type: "select" | "unselect" | "unselect-all" | "select-all-page";
  payload: AccountIdSelectionPayload;
};
export const selectedAccountIdsReducer = (
  state: Set<string>,
  action: SelectedAccountIdsAction
) => {
  const { type, payload } = action;
  switch (type) {
    case "select":
      if (!payload.single) return state;
      return new Set([...state, payload.single]);
    case "unselect":
      if (!payload.single) return state;
      state.delete(payload.single);
      return new Set([...state]);
    case "unselect-all":
      return new Set([]);
    case "select-all-page":
      if (!payload.multiple) return state;
      return new Set([...state, ...payload.multiple]);
    default:
      return state;
  }
};
