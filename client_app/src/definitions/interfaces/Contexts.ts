import {User} from '../configs/authConfig'
export type AuthContextState = {
    authenticated: boolean,
    setAuthenticated: Function,
    loading?:boolean,
    user: User
}