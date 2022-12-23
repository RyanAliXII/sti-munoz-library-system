import { useState } from "react";
import { boolean } from "yup";
const useToggle = (initial?: boolean) => {
    const [bool, setBool] = useState<boolean>(initial ?? false) 
    return {
        value: bool,
        toggle:()=>{
            setBool(prev=> !prev)
        }
    }
};
export const useToggleManual = (initial?: boolean) => {
    const [bool, setBool] = useState<boolean>(initial ?? false) 
    return {
        value: bool,
        set:(boolParam: boolean)=>{
            setBool(prev=> boolParam)
        }
    }
};
export const  useSwitch = (initial?: boolean) => {
    const [bool, setBool] = useState<boolean>(initial ?? false) 
    return {
        isOpen: bool,
        close: ()=>{
            setBool(false)
        },
        open: ()=>{
            setBool(true)
        },
        set : (bool: boolean)=>{
            setBool(bool)
        }
    }
}
export default useToggle