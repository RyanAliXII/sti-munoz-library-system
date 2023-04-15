import { PopupRequest, Configuration } from "@azure/msal-browser";

export const CLIENT_ID = "1b3617d9-7634-43f9-acf2-bd45c0b45ad6";
export const API_CLIENT_ID = "770a2b1b-6004-4a51-94a8-cd008797ba92";

const uri = import.meta.env.PROD
  ? "https://sti-munoz-library.online:5201"
  : "http://localhost:5201";
const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority:
      "https://login.microsoftonline.com/87731d3d-9f08-4782-b34e-5979bb65be87",
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
