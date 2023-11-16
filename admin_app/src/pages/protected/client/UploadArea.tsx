import Dashboard from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { toast } from "react-toastify";
import Uppy from "@uppy/core";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { apiScope } from "@definitions/configs/msal/scopes";
import { useMsal } from "@azure/msal-react";
import { useEffect, useState } from "react";
import { Button } from "flowbite-react";
type UploadAreaProps = {
  refetch: () => void;
};
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".csv", ".xlsx"],
    maxNumberOfFiles: 1,
  },
}).use(XHRUpload, {
  headers: {
    Authorization: `Bearer`,
  },

  endpoint: `${BASE_URL_V1}/accounts/bulk`,
});
const UploadArea = ({ refetch }: UploadAreaProps) => {
  const { instance: msalInstance } = useMsal();
  const [numberOfUploadedFiles, setNumberOfUploadedFiles] = useState(0);
  const [error, setError] = useState<undefined | string>(undefined);
  useEffect(() => {
    const onSuccessUpload = () => {
      toast.success("Accounts have been imported.");
      refetch();
    };
    const addFile = () => {
      setNumberOfUploadedFiles((prev) => prev + 1);
    };
    const removeFile = () => {
      setNumberOfUploadedFiles((prev) => prev - 1);
    };
    const onErrorUpload = () => {};
    uppy.on("file-added", addFile);
    uppy.on("file-removed", removeFile);

    uppy.on("upload-success", onSuccessUpload);
    uppy.on("upload-error", (file, err, response) => {
      const { data } = response?.body;
      if (data?.error) {
        setError(data?.error);
      }
    });
    return () => {
      uppy.off("upload-success", onSuccessUpload);
      uppy.off("file-added", addFile);
      uppy.off("file-removed", removeFile);
      uppy.off("upload-error", onErrorUpload);
      uppy.cancelAll();
    };
  }, []);
  const importAccounts = async () => {
    setError(undefined);
    const tokens = await msalInstance.acquireTokenSilent({
      scopes: [apiScope("LibraryServer.Access")],
    });
    uppy.getPlugin("XHRUpload")?.setOptions({
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    uppy.upload().finally(() => {
      uppy.cancelAll();
    });
  };

  return (
    <div>
      {error && (
        <div
          className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50  dark:text-red-400 "
          role="alert"
        >
          <svg
            className="flex-shrink-0 inline w-4 h-4 mr-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          <span className="sr-only">Info</span>
          <div>{error}</div>
        </div>
      )}
      <Dashboard
        uppy={uppy}
        hideUploadButton={true}
        hideRetryButton={true}
        locale={{
          strings: {
            browseFiles: " browse",
            dropPasteFiles: "Drop a .csv or xlsx, click to %{browse}",
          },
        }}
      ></Dashboard>

      {numberOfUploadedFiles ? (
        <Button color="primary" className="mt-6" onClick={importAccounts}>
          Import accounts
        </Button>
      ) : null}
    </div>
  );
};
export default UploadArea;
