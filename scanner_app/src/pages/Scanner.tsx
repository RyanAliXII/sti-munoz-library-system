import { useEffect, useRef, useState } from "react";
import { CameraDevice, Html5Qrcode } from "html5-qrcode";
import { useMutation } from "react-query";
import axiosClient from "@definitions/config/axios";
const Scanner = () => {
  const readerRef = useRef<HTMLDivElement | null>(null);
  const [_, setCameras] = useState<CameraDevice[]>([]);
  //   const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  let scanner: Html5Qrcode;
  useEffect(() => {
    initScanner();
  }, []);
  const initScanner = async () => {
    if (!scanner?.getState()) {
      scanner = new Html5Qrcode("reader");
      scanner.start(
        { facingMode: "environment" },
        { fps: 10 },
        (result) => {
          log.mutate(result);
          scanner.pause();
          setTimeout(() => {
            scanner.resume();
          }, 1000);
        },
        () => {}
      );
      await initCameras();
    }
  };
  const log = useMutation({
    mutationFn: (clientId: string) =>
      axiosClient.post(
        `/logs/clients/${clientId}`,
        {},
        { withCredentials: true }
      ),
    onSettled: () => {},
  });
  const initCameras = async () => {
    try {
      const cameraIds = await Html5Qrcode.getCameras();
      setCameras(cameraIds);
    } catch (err) {
      setCameras([]);
    }
  };
  return (
    <div>
      <div className="h-screen w-full flex items-center justify-center">
        <section className="w-11/12 lg:w-6/12 flex flex-col lg:flex-row border p-2">
          <div
            ref={readerRef}
            id="reader"
            className="w-full p-5 border"
            style={{ maxWidth: "400px" }}
          ></div>

          <div className="w-full items-center flex justify-center">
            <div>
              <h2 className=" text-green-500 text-lg lg:text-3xl font-bold">
                Ready to Scan...
              </h2>
              <p className="text-gray-500">Point your QR Code in the camera.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Scanner;
