import { CLIENT_ID } from "./msal.config";

export const MS_GRAPH_SCOPE = [
  "User.Read",
  "User.ReadBasic.All",
  "openid",
  "profile",
];

export const createScope = (scope: string) => {
  return `api://${CLIENT_ID}/${scope}`;
};
export const SCOPES = {
  library: {
    access: createScope("Library.Admin.Access"),
  },
  pulisher: {
    read: createScope("Publisher.Read"),

    delete: createScope("Publisher.Delete"),
  },
  book: {
    read: createScope("Book.Read"),
  },
};
