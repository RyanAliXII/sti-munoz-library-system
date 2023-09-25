import { useEffect, useRef, useState } from "react";
import { CameraDevice, Html5Qrcode } from "html5-qrcode";
import { useMutation } from "react-query";
import axiosClient from "@definitions/config/axios";
import { AxiosResponse } from "axios";
const Scanner = () => {
  const readerRef = useRef<HTMLDivElement | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [_, setCameras] = useState<CameraDevice[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [client, setClient] = useState({
    displayName: "",
    email: "",
  });
  //   const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  let scannerRef = useRef<Html5Qrcode | null>(null);
  useEffect(() => {
    if (scannerRef.current == null) {
      scannerRef.current = scannerRef.current = new Html5Qrcode("reader");
    }
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current?.stop().then(() => {
            scannerRef.current?.clear();
          });
          setIsCameraOpen(false);
          return;
        }
        scannerRef.current.clear();
        setIsCameraOpen(false);
      }
    };
  }, []);
  const log = useMutation({
    mutationFn: (clientId: string) =>
      axiosClient.post(
        `/logs/clients/${clientId}`,
        {},
        { withCredentials: true }
      ),
    onSettled: (response) => {
      if (response?.status === 200) {
        const { data } = response.data;
        setClient(data?.client);
        setHasScanned(true);
        setTimeout(() => {
          scannerRef.current?.resume();
          setHasScanned(false);
        }, 1500);
      }
    },
  });
  // const initCameras = async () => {
  //   try {
  //     const cameraIds = await Html5Qrcode.getCameras();
  //     setCameras(cameraIds);
  //   } catch (err) {
  //     setCameras([]);
  //   }
  // };
  const initScanner = () => {
    scannerRef.current?.start(
      { facingMode: "environment" },
      {
        fps: 10,
      },
      onSuccessScan,
      onErrorScan
    );
    setIsCameraOpen(true);
  };
  const onSuccessScan = (value: string) => {
    scannerRef.current?.pause(true);
    setHasScanned(true);
    log.mutate(value);
  };
  const onErrorScan = () => {};

  const sectionClass = isCameraOpen
    ? "w-11/12 lg:w-6/12 flex flex-col lg:flex-row border p-2 gap-1 item"
    : "hidden";
  return (
    <div>
      <div className="h-screen w-full flex items-center justify-center">
        {!isCameraOpen && (
          <div>
            <button
              className="btn text-white bg-blue-500 px-3  rounded py-1"
              onClick={initScanner}
            >
              Initialize Scanner
            </button>
          </div>
        )}
        <section className={sectionClass}>
          <div
            ref={readerRef}
            id="reader"
            className="w-full p-5 border"
            style={{ maxWidth: "400px" }}
          ></div>

          {!hasScanned && (
            <div className="w-full items-center flex justify-center">
              <div>
                <h2 className=" text-green-500 text-lg lg:text-3xl font-bold">
                  Ready to Scan...
                </h2>
                <p className="text-gray-500">
                  Point your QR Code in the camera.
                </p>
              </div>
            </div>
          )}
          {hasScanned && (
            <div className="w-full items-center flex justify-center">
              <div>
                <h2 className=" text-green-500 text-lg lg:text-3xl font-bold">
                  You can now enter the library.
                </h2>
                <div className="px-2">
                  <h3 className="text-lg text-gray-600">
                    {client.displayName}
                  </h3>
                  <p className="text-gray-500">{client.email}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Scanner;
