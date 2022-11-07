import React, {ReactNode} from 'react'

export type BaseProps = {
    children?: ReactNode
   
}
export interface PublicRouteProps extends BaseProps{
    restricted: boolean
}

export interface DrawerProps extends BaseProps{
    drawerButton: ReactNode | JSX.Element | JSX.Element[]
}
export interface DrawerButtonProps extends BaseProps{
    icon: ReactNode | JSX.Element | JSX.Element[]
    text: string 
}