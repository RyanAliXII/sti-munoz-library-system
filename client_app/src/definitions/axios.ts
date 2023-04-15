import axios from "axios";
import { BASE_URL_V1 } from "./api.config";

const axiosClient = axios.create({
  baseURL: BASE_URL_V1,
  withCredentials: true,
  headers: {},
});
export default axiosClient;
