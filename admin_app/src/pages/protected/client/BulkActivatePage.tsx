import Container from "@components/ui/container/Container";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import XHRUpload from "@uppy/xhr-upload";
import DashboardComponent from "@uppy/react/src/Dashboard";
import { Button, Datepicker, Label } from "flowbite-react";
import { useMsal } from "@azure/msal-react";
import { apiScope } from "@definitions/configs/msal/scopes";
import { FormEvent, useEffect, useState } from "react";
import { useSwitch } from "@hooks/useToggle";
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
  const [messages, setMessages] = useState<string[]>([]);
  useEffect(() => {
    uppy.on("upload-error", (file, err, response) => {
      const messages = response?.body?.data?.errors?.messages;
      if (messages) {
        setMessages(messages ?? []);
      }
    });
  }, []);
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
    } finally {
      uppy.cancelAll();
    }
  };
  const errorModal = useSwitch();
  return (
    <Container>
      <div className="pb-4">
        <h1 className="text-2xl dark:text-white">Activate Accounts</h1>
      </div>
      <div></div>
      <form onSubmit={importAccounts}>
        <div className="pb-2">
          <Label>Active Until</Label>
          <Datepicker minDate={new Date()} />
        </div>
        <div className="pb-2">
          <Label>CSV or Excel Masterlist</Label>
          <DashboardComponent
            hideUploadButton={true}
            uppy={uppy}
            height={"200px"}
          />
        </div>
        <div className="py-2 gap-2 flex">
          <Button color="primary" type="submit">
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
