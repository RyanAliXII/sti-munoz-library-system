import { RouterProvider } from "react-router-dom";

import "@assets/css/global.css";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import SidebarProvider from "@contexts/SiderbarContext";
import { SocketProvider } from "@contexts/SocketContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import "react-responsive-modal/styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./assets/css/tailwind.css";
import { AuthProvider } from "./contexts/AuthContext";
import msalConfig from "./definitions/configs/msal/msal.config";
import pages from "./pages/Pages";
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
