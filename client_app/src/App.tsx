import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import msalConfig from "./definitions/configs/msal/msal.config";
import "./assets/css/tailwind.css";
import "react-responsive-modal/styles.css";
import { useEffect } from "react";

import pages from "./pages/Pages";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
function App() {
  const msalInstance = new PublicClientApplication(msalConfig);
  useEffect(() => {
    document.title = "Client";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <RouterProvider router={pages} />
        </AuthProvider>
      </MsalProvider>
    </QueryClientProvider>
  );
}

export default App;
