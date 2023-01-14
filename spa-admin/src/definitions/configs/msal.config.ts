import { PopupRequest, Configuration } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: "1b3617d9-7634-43f9-acf2-bd45c0b45ad6",
    authority:
      "https://login.microsoftonline.com/87731d3d-9f08-4782-b34e-5979bb65be87",
    redirectUri: "http://localhost:5201",
    postLogoutRedirectUri: "http://localhost:5201",
  },
  cache: {
    cacheLocation: "localStorage",
  },
  system: {
    iframeHashTimeout: 10000,
  },
};
export const loginRequest: PopupRequest = {
  scopes: ["User.Read"],
};

export default msalConfig;
