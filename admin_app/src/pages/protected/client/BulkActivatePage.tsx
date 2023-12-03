import Container from "@components/ui/container/Container";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import XHRUpload from "@uppy/xhr-upload";
import DashboardComponent from "@uppy/react/src/Dashboard";
import { Button } from "flowbite-react";
import { useMsal } from "@azure/msal-react";
import { apiScope } from "@definitions/configs/msal/scopes";
import { FormEvent } from "react";
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
    uppy.upload().finally(() => {
      uppy.cancelAll();
    });
  };
  return (
    <Container>
      <form onSubmit={importAccounts}>
        <div className="py-2"></div>
        <DashboardComponent
          className="mt-5 "
          hideUploadButton={true}
          uppy={uppy}
          height={"200px"}
        />
        <div className="py-2">
          <Button color="primary" type="submit">
            Save
          </Button>
        </div>
      </form>
    </Container>
  );
};

export default BulkActivatePage;
