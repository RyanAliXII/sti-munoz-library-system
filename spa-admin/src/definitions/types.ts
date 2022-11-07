import { ReactNode } from "react"

export {}


export type SidebarNavItem = {
    to: string
    text?: string
    items:SidebarNavItem[] | []
    icon?: ReactNode | JSX.Element | JSX.Element[] 
}
