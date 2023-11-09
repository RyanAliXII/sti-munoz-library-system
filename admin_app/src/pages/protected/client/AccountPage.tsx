import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

import { Account } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";

import { PrimaryButton } from "@components/ui/button/Button";
import { CustomInput } from "@components/ui/form/Input";
import { useSwitch } from "@hooks/useToggle";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Uppy from "@uppy/core";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { TbFileImport } from "react-icons/tb";
import Modal from "react-responsive-modal";

import { useMsal } from "@azure/msal-react";
import HasAccess from "@components/auth/HasAccess";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { apiScope } from "@definitions/configs/msal/scopes";
import { useRequest } from "@hooks/useRequest";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import Dashboard from "@uppy/react/src/Dashboard";
import XHRUpload from "@uppy/xhr-upload";
import { toast } from "react-toastify";

import CustomPagination from "@components/pagination/CustomPagination";
import TableContainer from "@components/ui/table/TableContainer";
import { Avatar, Button, Table } from "flowbite-react";
import { useSearchParamsState } from "react-use-search-params-state";

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
const AccountPage = () => {
  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { type: "number", default: 1 },
    keyword: { type: "string", default: "" },
  });
  const {
    close: closeImportModal,
    isOpen: isImportModalOpen,
    open: openImportModal,
  } = useSwitch(false);
  const { Get } = useRequest();

  const fetchAccounts = async () => {
    try {
      const { data: response } = await Get("/accounts/", {
        params: {
          page: filterParams?.page,
          keyword: filterParams?.keyword,
        },
      });
      setTotalPages(response?.data?.metadata?.pages ?? 0);
      return response?.data?.accounts ?? [];
    } catch {
      return [];
    }
  };
  const queryClient = useQueryClient();
  const {
    data: accounts,
    isFetching,
    isError,
  } = useQuery<Account[]>({
    queryFn: fetchAccounts,
    queryKey: ["accounts", filterParams],
  });
  const debounceSearch = useDebounce();
  const search = (q: any) => {
    setFilterParams({ page: 1, keyword: q });
  };
  const handleSearch = (event: BaseSyntheticEvent) => {
    debounceSearch(search, event.target.value, 500);
  };

  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5 flex items-center gap-5">
        <div>
          <HasAccess requiredPermissions={["Account.Access"]}></HasAccess>
        </div>
      </div>

      <Container>
        <div className="flex items-center justify-between py-4">
          <CustomInput
            type="text"
            placeholder="Search accounts"
            onChange={handleSearch}
            defaultValue={filterParams?.keyword}
          ></CustomInput>

          <Button
            color="primary"
            onClick={() => {
              openImportModal();
            }}
          >
            <TbFileImport className="text-lg" />
            Import
          </Button>
        </div>
        <TableContainer>
          <LoadingBoundaryV2
            isLoading={isFetching}
            isError={isError}
            contentLoadDelay={150}
          >
            <Table>
              <Table.Head>
                <Table.HeadCell></Table.HeadCell>
                <Table.HeadCell>User</Table.HeadCell>
                <Table.HeadCell>Email</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y dark:divide-gray-700">
                {accounts?.map((account) => {
                  const url = new URL(
                    "https://ui-avatars.com/api/&background=2563EB&color=fff"
                  );
                  url.searchParams.set(
                    "name",
                    `${account.givenName} ${account.surname}`
                  );
                  return (
                    <Table.Row key={account.id}>
                      <Table.Cell>
                        <div className="h-10">
                          <Avatar img={url.toString()} rounded></Avatar>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="text-base font-semibold text-gray-900 dark:text-white">
                          {account.givenName.length + account.surname.length ===
                          0
                            ? "Unnamed"
                            : `${account.givenName} ${account.surname}`}
                        </div>
                        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          {account.displayName}
                        </div>
                      </Table.Cell>
                      <Table.Cell>{account.email}</Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
            <div className="py-3">
              <CustomPagination
                nextLabel="Next"
                pageRangeDisplayed={5}
                pageCount={totalPages}
                onPageChange={({ selected }) => {
                  setFilterParams({ page: selected + 1 });
                }}
                isHidden={totalPages <= 1}
                previousLabel="Previous"
                forcePage={filterParams?.page - 1}
                renderOnZeroPageCount={null}
              />
            </div>
          </LoadingBoundaryV2>
        </TableContainer>
      </Container>
      <ContainerNoBackground></ContainerNoBackground>

      <HasAccess requiredPermissions={["Account.Access"]}>
        {isImportModalOpen && (
          <Modal
            open={isImportModalOpen}
            onClose={closeImportModal}
            center
            closeOnEsc
            showCloseIcon={false}
            classNames={{
              modal: "w-9/12 lg:w-6/12",
            }}
          >
            <UploadArea
              refetch={() => {
                queryClient.invalidateQueries(["accounts"]);
              }}
            ></UploadArea>
          </Modal>
        )}
      </HasAccess>
    </>
  );
};
type UploadAreaProps = {
  refetch: () => void;
};
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
        <PrimaryButton className="mt-6" onClick={importAccounts}>
          Import accounts
        </PrimaryButton>
      ) : null}
    </div>
  );
};
export default AccountPage;
