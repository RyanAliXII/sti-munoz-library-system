import ProfileIcon from "@components/ProfileIcon";

import {
  Table,
  BodyRow,
  HeadingRow,
  Td,
  Th,
  Tbody,
  Thead,
} from "@components/ui/table/Table";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";

import { Account } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseSyntheticEvent, useEffect, useRef, useState } from "react";
import { Input } from "@components/ui/form/Input";
import { PrimaryButton } from "@components/ui/button/Button";
import { TbFileImport } from "react-icons/tb";
import { useSwitch } from "@hooks/useToggle";
import Modal from "react-responsive-modal";
import Uppy from "@uppy/core";

import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import XHRUpload from "@uppy/xhr-upload";
import Dashboard from "@uppy/react/src/Dashboard";
import { BASE_URL_V1 } from "@definitions/configs/api.config";
import { toast } from "react-toastify";
import { useRequest } from "@hooks/useRequest";
import { useMsal } from "@azure/msal-react";
import HasAccess from "@components/auth/HasAccess";
import { apiScope } from "@definitions/configs/msal/scopes";
import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";

import ReactPaginate from "react-paginate";
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
  // getResponseError(responseText, response) {
  //   return new Error(JSON.parse(responseText).message);
  // },
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
  const paginationClass =
    totalPages <= 1 ? "hidden" : "flex gap-2 items-center";
  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5 flex items-center gap-5">
        <h1 className="text-3xl font-bold text-gray-700">Accounts</h1>
        <div className="w-8/12 ">
          <Input
            type="text"
            className="mt-5"
            placeholder="Search account by email or name"
            onChange={handleSearch}
            defaultValue={filterParams?.keyword}
          ></Input>
        </div>
        <div>
          <HasAccess requiredPermissions={["Account.Access"]}>
            <PrimaryButton
              className="flex gap-1 items-center"
              onClick={() => {
                openImportModal();
              }}
            >
              <TbFileImport className="text-lg" />
              Import
            </PrimaryButton>
          </HasAccess>
        </div>
      </div>
      <LoadingBoundaryV2
        isLoading={isFetching}
        isError={isError}
        contentLoadDelay={150}
      >
        <Container>
          <Table>
            <Thead>
              <HeadingRow>
                <Td></Td>
                <Th>Email</Th>
                <Th>Client</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {accounts?.map((account) => {
                return (
                  <BodyRow key={account.id}>
                    <Td>
                      <div className="h-10">
                        <ProfileIcon
                          surname={account.surname}
                          givenName={account.givenName}
                        />
                      </div>
                    </Td>
                    <Td>{account.email}</Td>
                    <Td>{account.displayName}</Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </Container>
        <ContainerNoBackground>
          <ReactPaginate
            nextLabel="Next"
            pageLinkClassName="border px-3 py-0.5  text-center rounded"
            pageRangeDisplayed={5}
            pageCount={totalPages}
            disabledClassName="opacity-60 pointer-events-none"
            onPageChange={({ selected }) => {
              setFilterParams({ page: selected + 1 });
            }}
            className={paginationClass}
            previousLabel="Previous"
            forcePage={filterParams?.page - 1}
            previousClassName="px-2 border text-gray-500 py-1 rounded"
            nextClassName="px-2 border text-blue-500 py-1 rounded"
            renderOnZeroPageCount={null}
            activeClassName="border-none bg-blue-500 text-white rounded"
          />
        </ContainerNoBackground>
      </LoadingBoundaryV2>
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
