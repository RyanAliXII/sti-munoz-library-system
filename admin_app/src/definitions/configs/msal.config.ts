import { PopupRequest, Configuration } from "@azure/msal-browser";


const CLIENT_ID = "1b3617d9-7634-43f9-acf2-bd45c0b45ad6"
const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
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
export const MS_GRAPH_SCOPE =  ["User.Read", "User.ReadBasic.All", "openid", "profile"]
export const loginRequest: PopupRequest = {
  scopes: MS_GRAPH_SCOPE
};

export const createScope = (scope: string)=>{
  return `api://${CLIENT_ID}/${scope}`
} 
export const SCOPES = {
    library:{
      access : createScope("Library.Admin.Access"),
    },
    pulisher: {
        read: createScope("Publisher.Read"),
        delete: createScope("Publisher.Delete")
      },
    book:{
        read: createScope("Book.Read")
    }

}



export default msalConfig;
