import { PopupRequest, Configuration, LogLevel, BrowserCacheLocation } from "@azure/msal-browser";

export const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
export const API_CLIENT_ID = import.meta.env.VITE_API_CLIENT_ID;
export const uri = import.meta.env.VITE_REDIRECT_URI;
export const TENANT_ID = import.meta.env.VITE_TENANT_ID;

const isDev = import.meta.env.MODE === "development";
const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: uri,
    postLogoutRedirectUri: uri,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
  },
  system: {
    iframeHashTimeout: 10000,
    loggerOptions: isDev
      ? {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              break;
            case LogLevel.Info:
              console.info(message);
              break;
            case LogLevel.Verbose:
              console.debug(message);
              break;
            case LogLevel.Warning:
              console.warn(message);
              break;
          }
        },
      }
      : undefined, // Disable logging in production
  },
};

export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "User.ReadBasic.All", "openid", "profile"],
};

export default msalConfig;
