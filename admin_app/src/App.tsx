import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@contexts/AuthContext";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import msalConfig from "./definitions/configs/msal/msal.config";
import "@assets/css/tailwind.css";

import pages from "@pages/Pages";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { SocketProvider } from "@contexts/SocketContext";
import "@assets/css/global.css";
import "tippy.js/dist/tippy.css";
import "react-toastify/dist/ReactToastify.min.css";
const queryClient = new QueryClient();

const App = () => {
  const msalInstance = new PublicClientApplication(msalConfig);
  const router = createBrowserRouter(pages);

  return (
    <QueryClientProvider client={queryClient}>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <SocketProvider></SocketProvider>
          <RouterProvider router={router} />
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
};

export default App;
