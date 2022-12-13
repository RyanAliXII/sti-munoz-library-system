import { useState } from "react";
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
export default useToggle
