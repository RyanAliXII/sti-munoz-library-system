import { useMsal } from "@azure/msal-react";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { apiScope } from "@definitions/configs/msal/scopes";
import axios, { AxiosRequestConfig } from "axios";
import { StatusCodes } from "http-status-codes";
const DefaultScope = [apiScope("LibraryServer.Access")];
export const useRequest = () => {
  const { instance } = useMsal();
  const request = axios.create({
    baseURL: BASE_URL_V1,
    withCredentials: true,
  });

  request.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error?.response?.status === StatusCodes.UNAUTHORIZED) {
        const activeAccount = instance.getActiveAccount();
        const loginHint = activeAccount?.idTokenClaims?.login_hint;
        instance.logout({
          account: activeAccount,
          logoutHint: loginHint,
        });
      }
      if (error?.response?.status >= 400) {
        throw error;
      }
    }
  );
  const Post = async (
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any> | undefined,
    scopes = [] as string[]
  ) => {
    try {
      const tokens = await instance.acquireTokenSilent({
        scopes: [...DefaultScope, ...scopes],
      });
      const response = request.post(url, data, {
        ...config,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  };
  const Get = async (
    url: string,
    config?: AxiosRequestConfig<any>,
    scopes = [] as string[]
  ) => {
    try {
      const tokens = await instance.acquireTokenSilent({
        scopes: [...DefaultScope, ...scopes],
      });
      const response = request.get(url, {
        ...config,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  };
  const Delete = async (
    url: string,
    config?: AxiosRequestConfig<any>,
    scopes = [] as string[]
  ) => {
    try {
      const tokens = await instance.acquireTokenSilent({
        scopes: [...DefaultScope, ...scopes],
      });
      const response = request.delete(url, {
        ...config,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  };
  const Put = async (
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any> | undefined,
    scopes = [] as string[]
  ) => {
    try {
      const tokens = await instance.acquireTokenSilent({
        scopes: [...DefaultScope, ...scopes],
      });
      const response = request.put(url, data, {
        ...config,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  };
  const Patch = async (
    url: string,
    data?: any,
    config?: AxiosRequestConfig<any> | undefined,
    scopes = [] as string[]
  ) => {
    try {
      const tokens = await instance.acquireTokenSilent({
        scopes: [...DefaultScope, ...scopes],
      });

      const response = request.patch(url, data, {
        ...config,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  return {
    Post,
    Get,
    Delete,
    Patch,
    Put,
  };
};
