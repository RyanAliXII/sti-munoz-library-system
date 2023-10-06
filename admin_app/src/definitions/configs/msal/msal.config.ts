import { PopupRequest, Configuration } from "@azure/msal-browser";

export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
export const API_CLIENT_ID = import.meta.env.VITE_API_CLIENT_ID;
export const uri = import.meta.env.VITE_REDIRECT_URI;
export const TENANT_ID = import.meta.env.VITE_TENANT_ID;
const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: uri,
    postLogoutRedirectUri: uri,
  },
  cache: {
    cacheLocation: "localStorage",
  },
  system: {
    iframeHashTimeout: 10000,
  },
};
export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "User.ReadBasic.All", "openid", "profile"],
};

export default msalConfig;
