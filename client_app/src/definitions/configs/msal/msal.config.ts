import { PopupRequest, Configuration } from "@azure/msal-browser";

export const API_CLIENT_ID = "770a2b1b-6004-4a51-94a8-cd008797ba92";
export const CLIENT_ID = "e8119d61-569d-4c7c-8783-e605e6ddeaef";
const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority:
      "https://login.microsoftonline.com/87731d3d-9f08-4782-b34e-5979bb65be87",
    redirectUri: "http://localhost:5202",
    postLogoutRedirectUri: "http://localhost:5202",
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
