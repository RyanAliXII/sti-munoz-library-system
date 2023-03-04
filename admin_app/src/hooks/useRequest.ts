import { useMsal } from "@azure/msal-react"
import { SCOPES } from "@definitions/configs/msal/scopes"
import axios, { AxiosRequestConfig } from "axios"
import { StatusCodes } from "http-status-codes"

export const useRequest = ()=>{
    const {instance} = useMsal()
    const request = axios.create({
        baseURL: "http://localhost:5200/api/1",
        withCredentials: true,
    })
    request.interceptors.response.use(response=>{
        return response
    },  error =>{
        if (error.response.status === StatusCodes.UNAUTHORIZED){
                const activeAccount = instance.getActiveAccount()
                const loginHint = activeAccount?.idTokenClaims?.login_hint
                instance.logout({
                    account: activeAccount,
                    logoutHint: loginHint
                })
        }
        return error
    })
    const Post = async(url: string, data?: any, config?:AxiosRequestConfig<any> | undefined, scopes = [] as string[] )=>{
        try{
            const tokens = await instance.acquireTokenSilent({
                scopes:[SCOPES.library.access, ...scopes]
            })
            const response = request.post(url, data, {
                ...config,
                headers:{
                    "Authorization" : `Bearer ${tokens.accessToken}`,
                }
            })
            return response
        }
        catch(error){
            throw(error)
        }
    }
    const Get = async(url: string, config?:AxiosRequestConfig<any>, scopes = [] as string[])=>{
        try{
        const tokens = await instance.acquireTokenSilent({
            scopes:[SCOPES.library.access, ...scopes]
        })
       const response =  request.get(url, {
            ...config,
            headers:{
                "Authorization" : `Bearer ${tokens.accessToken}`,
            }
        })
        return response
        }
        catch(error){
            throw(error)
        }
    }
    const Delete = async(url: string, config?:AxiosRequestConfig<any>, scopes = [] as string[])=>{
        try{
            const tokens = await instance.acquireTokenSilent({
                scopes:[SCOPES.library.access, ...scopes]
            })
            const response = await request.delete(url, {
                ...config,
                headers:{
                    "Authorization" : `Bearer ${tokens.accessToken}`,
                }
            })
            return response
            
        }
        catch(error){
            throw(error)
        }
      
    }
    const Put = async(url: string, data?: any, config?:AxiosRequestConfig<any> | undefined, scopes = [] as string[] )=>{
        try{
            const tokens = await instance.acquireTokenSilent({
                scopes:[SCOPES.library.access, ...scopes]
            })
            const response = request.put(url, data, {
                ...config,
                headers:{
                    "Authorization" : `Bearer ${tokens.accessToken}`,
                }
            })
            return response
        }
        catch(error){
            throw(error)
        }
    }
    const Patch = async(url: string, data?: any, config?:AxiosRequestConfig<any> | undefined, scopes = [] as string[] )=>{
        try{
            const tokens = await instance.acquireTokenSilent({
                scopes:[SCOPES.library.access, ...scopes]
            })
          
            const response = request.patch(url, data, {
                ...config,
                headers:{
                    "Authorization" : `Bearer ${tokens.accessToken}`,
                }
            })
            return response
        }
        catch(error){
            throw(error)
        }
    }
   
   
    return {
        Post,
        Get,
        Delete,
        Patch,
        Put
    }

}