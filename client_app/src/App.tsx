import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import msalConfig from "./definitions/configs/authConfig";
import "./assets/css/tailwind.css";

import { useEffect } from "react";

import pages from "./pages/Pages";
function App() {
  const msalInstance = new PublicClientApplication(msalConfig);
  useEffect(() => {
    document.title = "Client";
  }, []);

  return (
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <RouterProvider router={pages} />
      </AuthProvider>
    </MsalProvider>
  );
}

export default App;
