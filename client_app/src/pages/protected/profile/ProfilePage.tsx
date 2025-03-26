import { useMsal } from "@azure/msal-react";
import Loader from "@components/Loader";
import { PrimaryButton } from "@components/ui/button/Button";
import { useAuthContext } from "@contexts/AuthContext";
import { BASE_URL_V1 } from "@definitions/api.config";
import { apiScope } from "@definitions/configs/msal/scopes";
import { buildS3Url } from "@definitions/s3";
import { Account, ModalProps } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Compressor from "@uppy/compressor";
import Uppy from "@uppy/core";
import "@uppy/core/dist/style.min.css";
import Dashboard from "@uppy/dashboard";
import "@uppy/dashboard/dist/style.min.css";
import { Dashboard as DashboardComponent } from "@uppy/react";
import XHRUpload from "@uppy/xhr-upload";
import { Button, Card } from "flowbite-react";
import html2canvas from "html2canvas";
import { FormEvent, useRef, useState } from "react";
import { AiFillCheckCircle } from "react-icons/ai";
import { BsArrowReturnLeft } from "react-icons/bs";
import { CiCircleRemove } from "react-icons/ci";
import { FaHandHolding, FaMoneyBill } from "react-icons/fa";
import { MdOutlinePending } from "react-icons/md";
import QRCode from "react-qr-code";
import Modal from "react-responsive-modal";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".png", ".webp", ".jpg"],
    maxNumberOfFiles: 1,
  },
})
  .use(Compressor)
  .use(Dashboard)
  .use(XHRUpload, {
    headers: {
      Authorization: `Bearer`,
    },
    method: "PUT",
    fieldName: "image",
    endpoint: `${BASE_URL_V1}/accounts/bulk`,
  });

const ProfilePage = () => {
  const { user } = useAuthContext();

  const { Get } = useRequest();
  const fetchAccount = async (): Promise<Account> => {
    try {
      const response = await Get(`/accounts/${user.id}`);
      const { data } = response.data;
      return data.account as Account;
    } catch (error) {
      return account as Account;
    }
  };

  const { data: account } = useQuery<Account>({
    queryFn: fetchAccount,
    queryKey: ["profileAccount"],
  });
  const qrRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadQRCode = async () => {
    try {
      setIsDownloading(true);
      if (!qrRef.current) return;
      const qrCanvas = await html2canvas(qrRef.current, { scale: 5 });
      const img = qrCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${user.id}.png`;
      link.href = img;
      link.click();
    } catch (error) {
      toast.error("Unknown error occured.");
    } finally {
      setIsDownloading(false);
    }
  };
  const {
    isOpen: isUploadProfileOpen,
    close: closeUploadProfileModal,
    open: openUploadProfile,
  } = useSwitch();
  if (!account) return <Loader />;
  const avatarUrl = `https://ui-avatars.com/api/?name=${account.givenName}+${account.surname}&background=2563EB&color=fff`;
  const profilePicUrl =
    account.profilePicture.length > 0
      ? buildS3Url(account.profilePicture)
      : avatarUrl;
  return (
    <div className="lg:w-8/12 mx-auto">
      <div className="mt-10 p-5">
        <img
          src={profilePicUrl}
          className="h-36 w-36  border rounded-full bg-black left-5"
          style={{ bottom: "-55px" }}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = avatarUrl;
          }}
        />
      </div>
      <div className="flex justify-between flex-col w-full px-9 ">
        <div>
          <div>
            <h1 className="lg:text-xl font-bold text-gray-800 dark:text-gray-200">
              {account.givenName} {account.surname}
            </h1>
            <h2 className="lg:text-lg text-gray-500 dark:text-gray-300">{account.email}</h2>
            <a
              className="text-sm underline text-blue-400"
              role="button"
              onClick={openUploadProfile}
            >
              Update Profile Picture
            </a>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 w-full mt-10 gap-3">
          <Card className="p-4">
          <Link
            to={"#"}
            className="w-full flex flex-col items-center justify-center text-red-500 gap-2"
          >
            <FaMoneyBill className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              PHP{" "}
              {account.metadata.totalPenalty.toLocaleString(undefined, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </span>
            <small className="text-xs lg:text-sm">Total Penalty</small>
          </Link>
          </Card>
          <Card>
          <Link
            to={"/borrowed-books?status_id=1"}
            className="w-full flex flex-col items-center justify-center gap-2 dark:text-gray-100"
          >
            <MdOutlinePending className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {account.metadata.pendingBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Pending Borrow Request
            </small>
          </Link>
          </Card>
          <Card>
          <Link
            to={"/borrowed-books?status_id=2"}
            className="w-full flex flex-col items-center justify-center  text-yellow-500 gap-2"
          >
            <AiFillCheckCircle className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {account.metadata.approvedBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Approved Borrow Request
            </small>
          </Link>
          </Card>
          <Card className="p-4">
          <Link
            to={"/borrowed-books?status_id=3"}
            className="w-full flex flex-col items-center justify-center text-success gap-2"
          >
            <FaHandHolding className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {account.metadata.checkedOutBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Checked-Out Books
            </small>
          </Link>
          </Card>
          <Card>
          <Link
            to={"/borrowed-books?status_id=4"}
            className="w-full flex flex-col items-center justify-center text-gray-500   dark:text-gray-300 gap-3"
          >
            <BsArrowReturnLeft className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {account.metadata.returnedBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Returned Books
            </small>
          </Link>
          </Card>
          <Card>
          <Link
            to={"/borrowed-books?status_id=5"}
            className="w-full flex flex-col items-center justify-center text-orange-500 gap-3"
          >
            <CiCircleRemove className="text-2xl" />
            <span className="text-xs font-bold break-words text-center md:text-sm lg:text-lg">
              {account.metadata.cancelledBooks}
            </span>
            <small className="text-xs lg:text-sm text-center">
              Cancelled Borrow Request
            </small>
          </Link>
          </Card>
        </div>
        <div className="flex flex-col mt-10 items-center gap-3">
          <Card className="px-10 py-5">
          <div ref={qrRef} className="flex flex-col items-center p-3">
            <QRCode
              value={account?.id ?? "none"}
              style={{ width: "2.0in", height: "2.0in" }}
            />
            <div className="text-center mt-4">
              <h2 className="font-bold dark:text-gray-100">STI Munoz Library Pass</h2>
              <p className="dark:text-gray-200">
                {user.givenName} {user.surname}
              </p>
          
            </div>
          </div>
          <div className="w-full flex justify-center">
              <Button
              onClick={downloadQRCode}
              color="light"
              disabled={isDownloading}
            >
              <div className="flex items-center gap-2">
                {isDownloading && <ClipLoader size={20} />}
                <span>Download QR</span>
              </div>
            </Button>
            </div>
          </Card>
          <div>
          </div>
        </div>
      </div>
      <UploadProfileModal
        isOpen={isUploadProfileOpen}
        closeModal={closeUploadProfileModal}
      />
    </div>
  );
};
const UploadProfileModal = ({ closeModal, isOpen }: ModalProps) => {
  const queryClient = useQueryClient();
  const { instance: msalInstance } = useMsal();
  const { user } = useAuthContext();
  if (!isOpen) return null;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const response = await msalInstance.acquireTokenSilent({
      scopes: [apiScope("LibraryServer.Access")],
    });
    uppy.getPlugin("XHRUpload")?.setOptions({
      headers: {
        Authorization: `Bearer ${response.accessToken}`,
      },
      endpoint: `${BASE_URL_V1}/accounts/${user.id}/profile-pictures`,
    });
    await uppy.upload();
    uppy.cancelAll();
    closeModal();
    toast.success("Profile picture updated.");
    queryClient.invalidateQueries(["profileAccount"]);
  };
  return (
    <Modal
      onClose={closeModal}
      open={isOpen}
      showCloseIcon={false}
      classNames={{ modal: "w-11/12 md:w-8/12 lg:w-5/12 rounded" }}
      center
    >
      <div>
        <h2 className="text-2xl mb-1">Attach Image</h2>
        <hr></hr>
        <form onSubmit={onSubmit}>
          <DashboardComponent
            className="mt-5"
            hideUploadButton={true}
            uppy={uppy}
            height={"200px"}
          />
          <PrimaryButton className="mt-2"> Save</PrimaryButton>
        </form>
      </div>
    </Modal>
  );
};

export default ProfilePage;
