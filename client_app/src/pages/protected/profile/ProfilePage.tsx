import { useAuthContext } from "@contexts/AuthContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import QRCode from "react-qr-code";

const ProfilePage = () => {
  const { user } = useAuthContext();
  const qrRef = useRef<HTMLDivElement | null>(null);
  const downloadQRCode = async () => {
    if (!qrRef.current) return;
    const qrCanvas = await html2canvas(qrRef.current, { scale: 2 });
    const doc = new jsPDF("l", "px", [300, 300]);
    doc.addImage(qrCanvas, 100, 60, 100, 100);
    doc.text(`LIBRARY PASS`, 150, 50, { align: "center" });
    doc.text(
      `${user.givenName.toUpperCase()} ${user.surname.toUpperCase()}`,
      150,
      180,
      {
        align: "center",
      }
    );

    doc.save(user.id);
  };
  return (
    <div className="lg:w-8/12 mx-auto">
      <div className="w-full h-56 bg-blue-500 relative">
        <div
          className="h-44 w-44 absolute  border rounded-full bg-black left-5"
          style={{ bottom: "-50px" }}
        ></div>
      </div>
      <div className="flex justify-between flex-col  w-full px-6 mt-16">
        <div>
          <div>
            <h1 className="text-2xl font-bold ">
              {user.givenName} {user.surname}
            </h1>
            <h2 className="text-lg text-gray-500">{user.email}</h2>
          </div>
        </div>
        <div className="flex flex-col mt-10 items-center gap-3">
          <div ref={qrRef}>
            <QRCode value={user?.id ?? "none"} className="w-32 h-32" />
          </div>
          <div>
            <button className="btn btn-primary" onClick={downloadQRCode}>
              Download QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
