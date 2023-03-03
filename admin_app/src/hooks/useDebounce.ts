import {  useState } from 'react'


const  useDebounce =()=>{
  const [timeout, setTO] = useState<number | undefined>(undefined)

  const debounce = (func:Function,value:any,wait:number)=>{
    clearTimeout(timeout)
    const t = window.setTimeout(()=> func(value), wait)
    setTO(t)
  }
  
  return debounce
}

export default useDebounce