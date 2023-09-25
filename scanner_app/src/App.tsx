import { useQuery } from "react-query";
import "./assets/css/tailwind.css";
import Login from "./pages/Login";
import axiosClient from "@definitions/config/axios";
const App = () => {
  const checkAuth = async () => {
    const { data: response } = await axiosClient.post("/auth");
    return response?.data?.account ?? { username: "", description: "" };
  };
  const {} = useQuery({
    queryFn: checkAuth,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return (
    <>
      <Login />
    </>
  );
};

export default App;
