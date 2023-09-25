import { QueryClient, QueryClientProvider } from "react-query";
import "./assets/css/tailwind.css";
import Login from "./pages/Login";
const App = () => {
  const queryClient = new QueryClient();
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Login />
      </QueryClientProvider>
    </>
  );
};

export default App;
