export enum AccountIdsSelectionAction {
  Select = "Select",
  Unselect = "Unselect",
  UnselectAll = "UnselectAll",
}
export type SelectedAccountIdsAction = {
  type: AccountIdsSelectionAction;
  payload: string;
};
export const selectedAccountIdsReducer = (
  state: string[],
  action: SelectedAccountIdsAction
) => {
  const { type, payload } = action;
  switch (type) {
    case AccountIdsSelectionAction.Select:
      return [...state, payload];
    case AccountIdsSelectionAction.Unselect:
      return state.filter((accountId) => accountId != payload);
    case AccountIdsSelectionAction.UnselectAll:
      return [];
    default:
      return state;
  }
};
