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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@assets/css/global.css";
import { SocketProvider } from "@contexts/SocketContext";
import SidebarProvider from "@contexts/SiderbarContext";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
function App() {
  const msalInstance = new PublicClientApplication(msalConfig);
  useEffect(() => {
    document.title = "STI Munoz Library | Patron";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <SocketProvider>
            <SidebarProvider>
            <RouterProvider router={pages} />
            </SidebarProvider>
          </SocketProvider>
        </AuthProvider>
      </MsalProvider>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        closeButton={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </QueryClientProvider>
  );
}

export default App;
