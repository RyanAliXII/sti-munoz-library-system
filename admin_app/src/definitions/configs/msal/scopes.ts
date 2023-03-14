import { API_CLIENT_ID } from "./msal.config";

export const MS_GRAPH_SCOPE = [
  "User.Read",
  "User.ReadBasic.All",
  "openid",
  "profile",
];
export const apiScope = (scope: string) => {
  return `api://${API_CLIENT_ID}/${scope}`;
};
