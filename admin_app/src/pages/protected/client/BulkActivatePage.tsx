import { useMsal } from "@azure/msal-react";
import Container from "@components/ui/container/Container";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { apiScope } from "@definitions/configs/msal/scopes";
import { useSettings } from "@hooks/data-fetching/settings";
import { useSwitch } from "@hooks/useToggle";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import DashboardComponent from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { Alert, Button, Label } from "flowbite-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BulkActivateErrorModal from "./BulkActivateErrorModal";
const uppy = new Uppy({
  restrictions: {
    allowedFileTypes: [".csv", ".xlsx"],
    maxNumberOfFiles: 1,
  },
})
  .use(Dashboard)
  .use(XHRUpload, {
    headers: {
      Authorization: `Bearer`,
    },
    method: "PUT",
    fieldName: "file",
    endpoint: `${BASE_URL_V1}/accounts/bulk/activation`,
  });

const BulkActivatePage = () => {
  const { instance: msalInstance } = useMsal();
  const [isInvalidActivationDate, setIsInvalidActivationDate] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    uppy.on("upload-error", (file, err, response) => {
      const messages = response?.body?.data?.errors?.messages;
      if (messages) {
        setMessages(messages ?? []);
      }
    });
  }, []);

  const {} = useSettings({
    onSuccess: (settings) => {
      const validitySettings = settings?.["app.account-validity"];
      if (!validitySettings) return;
      try {
        const validityDate = new Date(validitySettings.value);
        const today = new Date();

        if (validityDate.setHours(0, 0, 0, 0) <= today.setHours(0, 0, 0, 0)) {
          setIsInvalidActivationDate(true);
        }
      } catch (err) {
        console.error(err);
      }
    },
  });
  const importAccounts = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tokens = await msalInstance.acquireTokenSilent({
      scopes: [apiScope("LibraryServer.Access")],
    });
    uppy.getPlugin("XHRUpload")?.setOptions({
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    try {
      setMessages([]);
      await uppy.upload();
      navigate("/clients/accounts");
    } finally {
      uppy.cancelAll();
    }
  };
  const errorModal = useSwitch();
  return (
    <Container>
      <div className="pb-1">
        {isInvalidActivationDate && (
          <Alert color="warning" rounded className="flex">
            The account validity in settings is behind or equivalent to current
            date. Please adjust it in the setting.{" "}
            <Link
              className="font-medium  items-center gap-1 underline underline-offset-2"
              to="/system/settings"
            >
              Go to settings
            </Link>
          </Alert>
        )}
      </div>
      <div className="pb-4">
        <h1 className="text-2xl dark:text-white">Activate Accounts</h1>
      </div>
      <div></div>
      <form onSubmit={importAccounts}>
        <div className="pb-2">
          <Label>CSV or Excel Masterlist</Label>
          <DashboardComponent
            hideUploadButton={true}
            uppy={uppy}
            height={"200px"}
          />
        </div>
        <div className="py-2 gap-2 flex">
          <Button
            color="primary"
            type="submit"
            disabled={isInvalidActivationDate}
          >
            Save
          </Button>
          <Button
            disabled={messages.length === 0}
            color="failure"
            onClick={errorModal.open}
          >
            View Errors
          </Button>
        </div>
      </form>
      <BulkActivateErrorModal
        closeModal={errorModal.close}
        isOpen={errorModal.isOpen}
        messages={messages}
      />
    </Container>
  );
};

export default BulkActivatePage;
