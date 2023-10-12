import { useQuery } from "react-query";
import "./assets/css/tailwind.css";
import Login from "./pages/Login";
import axiosClient from "@definitions/config/axios";
import Ellipsis from "./assets/images/Ellipsis.svg";
import Scanner from "./pages/Scanner";
const App = () => {
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const { data: response } = await axiosClient.post(
      "/auth",
      {},
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token} `,
        },
      }
    );
    return response?.data?.account ?? { username: "", description: "" };
  };
  const { isFetching, isError, refetch } = useQuery({
    queryFn: checkAuth,
    retry: false,
    refetchOnWindowFocus: false,
    queryKey: ["account"],
  });
  const revalidateAuth = () => {
    refetch();
  };

  if (isFetching) {
    return <Loader />;
  }
  if (isError) {
    return <Login revalidateAuth={revalidateAuth} />;
  }
  return <Scanner revalidateAuth={revalidateAuth} />;
};

const Loader = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
        <img src={Ellipsis}></img>
      </div>
    </section>
  );
};

export default App;
