import axiosClient from "@definitions/config/axios";
import { ReactNode, createContext, useContext, useState } from "react";
import { useQuery } from "react-query";
import Loader from "../components/Loader";

const AuthContext = createContext({
  isAuth: false,
  revalidateAuth: async () => {},
});
const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [isAuth, setAuth] = useState(false);
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

  const { isFetching, refetch } = useQuery({
    queryFn: checkAuth,
    retry: false,
    refetchOnWindowFocus: false,
    queryKey: ["account"],
    onSuccess() {
      setAuth(true);
    },
    onError() {
      setAuth(false);
    },
  });
  const revalidateAuth = async () => {
    await refetch();
  };
  return (
    <AuthContext.Provider value={{ isAuth, revalidateAuth }}>
      {isFetching ? <Loader /> : children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthProvider;
