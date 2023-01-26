import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export type UseQrScannerProps = {
    onScan?:(decodedText:string, decodedResult:object)=>void
    onFail?:(err:unknown)=>void
    elementId:string
}
const useQRScanner = ({onScan, onFail, elementId}:UseQrScannerProps) => {
    
    const onFailDefault = ()=>{}
    const onScanDefault = ()=>{}

    useEffect(()=>{
        let html5QrcodeScanner: Html5QrcodeScanner
        html5QrcodeScanner = new Html5QrcodeScanner(
            elementId,
            {
              fps: 10,
              rememberLastUsedCamera: true,
              aspectRatio: 4 / 3,
              showTorchButtonIfSupported: true,
              showZoomSliderIfSupported: true,
              defaultZoomValueIfSupported: 2,
              qrbox: 75,
                
            },
            /* verbose= */ false
          );
       
            html5QrcodeScanner.render(onScan ?? onScanDefault, onFail ?? onFailDefault);
                  
          return () => {
            html5QrcodeScanner.clear();
          };
    },[])
    
};

export default useQRScanner;