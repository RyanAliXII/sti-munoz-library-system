import { ChangeEvent, useEffect, useRef, useState } from "react";
import { CameraDevice, Html5Qrcode } from "html5-qrcode";
import { useMutation } from "react-query";
import axiosClient from "@definitions/config/axios";
import { verify } from "crypto";
const Scanner = () => {
  const readerRef = useRef<HTMLDivElement | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [hasScanned, setHasScanned] = useState(false);
  const [client, setClient] = useState({
    displayName: "",
    email: "",
  });

  let scannerRef = useRef<Html5Qrcode | null>(null);
  useEffect(() => {
    if (scannerRef.current == null) {
      scannerRef.current = scannerRef.current = new Html5Qrcode("reader");
    }
    const TO = setTimeout(() => {
      initScanner();
    }, 2000);

    return () => {
      clearTimeout(TO);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current?.stop().then(() => {
            scannerRef.current?.clear();
          });

          return;
        }
        scannerRef.current.clear();
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
  const initCameras = async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      setCameras(cameras);
      return cameras;
    } catch (err) {
      setCameras([]);
      return [];
    }
  };
  const initScanner = async () => {
    const listOfCameras = await initCameras();
    let cameraIdOrConfig: string | MediaTrackConstraints;
    if (listOfCameras.length > 0) {
      cameraIdOrConfig = listOfCameras[0].id;
      setSelectedCameraId(cameraIdOrConfig);
    } else {
      cameraIdOrConfig = { facingMode: "environment" };
    }
    startScanner(cameraIdOrConfig);
  };
  const startScanner = (cameraIdOrConfig: string | MediaTrackConstraints) => {
    scannerRef.current?.start(
      cameraIdOrConfig,
      {
        fps: 10,
      },
      onSuccessScan,
      onErrorScan
    );
  };
  const changeCamera = async (event: ChangeEvent<HTMLSelectElement>) => {
    const cameraId = event.target.value;
    if (cameraId == "") return;
    setSelectedCameraId(cameraId);
    await scannerRef.current?.stop();
    startScanner(cameraId);
  };
  const onSuccessScan = (value: string) => {
    scannerRef.current?.pause(true);
    setHasScanned(true);
    log.mutate(value);
  };
  const onErrorScan = () => {};

  const scannerViewClass = !hasScanned
    ? "w-full border border-gray-300 rounded dark:border-gray-700 max-w-lg"
    : "w-full border border-gray-300 outline outline-4 outline-green-500 rounded dark:border-gray-700 max-w-lg";
  return (
    <div className="h-screen w-full flex flex-col items-center  justify-center dark:bg-gray-800">
      <section
        id="settings"
        className="w-11/12 lg:w-10/12 mb-5 px-1"
        style={{ maxWidth: "1250px" }}
      >
        <div className="w-full">
          <label className="text-gray-700 dark:text-white mb-0.5">Camera</label>
          <select
            className="w-full py-2 border-gray-400 dark:bg-gray-200 rounded px-2 text-gray-700"
            onChange={changeCamera}
            value={selectedCameraId}
          >
            <option value={""}>Select Camera</option>
            {cameras?.map((camera) => {
              return (
                <option value={camera.id} key={camera.id}>
                  {camera.label}
                </option>
              );
            })}
          </select>
        </div>
      </section>
      <section
        className="w-11/12 lg:w-10/12 flex flex-col lg:flex-row border p-2 gap-1 items-center rounded dark:border-gray-700"
        style={{ maxWidth: "1250px" }}
      >
        <div
          ref={readerRef}
          id="reader"
          className={scannerViewClass}

          // style={{ maxWidth: "400px" }}
        ></div>

        {!hasScanned && (
          <div className="w-full items-center flex lg:justify-center px-1 max-w-lg lg:max-w-none">
            <div>
              <h2 className=" text-green-500 text-lg md:text-2xl lg:text-3xl font-bold">
                Ready to Scan...
              </h2>
              <p className="text-gray-500">Point your QR Code in the camera.</p>
            </div>
          </div>
        )}
        {hasScanned && (
          <div className="w-full items-center flex lg:justify-center max-w-lg lg:max-w-none">
            <div>
              <h2 className=" text-green-500 text-lg md:text-2xl lg:text-3xl font-bold">
                You can now enter the library.
              </h2>
              <div className="px-1 lg:px-2">
                <h3 className="text-lg md:text-xl text-gray-600">
                  {client.displayName}
                </h3>
                <p className="text-gray-500 md:text-lg">{client.email}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Scanner;
