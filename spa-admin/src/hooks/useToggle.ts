import { useState } from "react";
const useToggle = (initial?: boolean) => {
    const [bool, setBool] = useState(initial ?? false) 
    return {
        value: bool,
        toggle:()=>{
            setBool(prev=> !prev)
        }
    }
};

export default useToggle
