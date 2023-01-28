
import React, { useEffect } from 'react';


export type ScrollWatchProps = {
    element: Element | Window | HTMLElement | Document
    onScrollEnd?: ()=>void
    onScroll?:(event:Event)=>void
}

const useScrollWatcher = ({element, onScroll, onScrollEnd}: ScrollWatchProps) => {

    useEffect(()=>{
        const OFFSET = 30;
        if(element === window){
            const listenScrollForElement = (event: Event) => {
                onScroll?.(event)
                if(document.documentElement.scrollTop + window.innerHeight == document.documentElement.scrollHeight)
                {
                  onScrollEnd?.()
                }
              }; 
              element.addEventListener("scroll", listenScrollForElement)
              return ()=>{
                element.removeEventListener("scroll", listenScrollForElement )
             }
        }
        else{
            const listenScrollForElement = (event: Event) => {
                const target = event.target as HTMLElement
                ;
                onScroll?.(event)
                if (
                  target.scrollTop + OFFSET >=
                  target.scrollHeight - target.offsetHeight
                ) {
                  onScrollEnd?.()
                }
              };
              element.addEventListener("scroll", listenScrollForElement)
              return ()=>{
                element.removeEventListener("scroll", listenScrollForElement )
             }
          
        }
        
    },[])


};

export default useScrollWatcher;