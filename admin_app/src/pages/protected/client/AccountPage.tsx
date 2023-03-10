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
import Container from "@components/ui/container/Container";

import { Account } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";
import useScrollWatcher from "@hooks/useScrollWatcher";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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
import { SCOPES } from "@definitions/configs/msal/scopes";
import HasAccess from "@components/auth/HasAccess";
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
  const [searchKeyword, setSearchKeyWord] = useState<string>("");

  const {
    close: closeImportModal,
    isOpen: isImportModalOpen,
    open: openImportModal,
  } = useSwitch(false);
  const { Get } = useRequest();
  const fetchAccounts = async ({ pageParam = 0 }) => {
    try {
      const { data: response } = await Get("/accounts/", {
        params: {
          offset: pageParam,
          keyword: searchKeyword,
        },
      });
      return response?.data?.accounts ?? [];
    } catch {
      return [];
    }
  };
  const queryClient = useQueryClient();
  const { data, fetchNextPage, refetch } = useInfiniteQuery<Account[]>({
    queryFn: fetchAccounts,
    queryKey: ["accounts"],
    refetchOnWindowFocus: false,
    getNextPageParam: (_, allPages) => {
      return allPages.length * 30;
    },
  });
  useScrollWatcher({
    element: window,
    onScrollEnd: () => {
      fetchNextPage();
    },
  });
  const debounceSearch = useDebounce();
  const search = () => {
    queryClient.setQueryData(["accounts"], () => {
      return {
        pageParams: [],
        pages: [],
      };
    });
    refetch();
  };
  const handleSearch = (event: BaseSyntheticEvent) => {
    setSearchKeyWord(event.target.value);
    debounceSearch(search, "", 500);
  };

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
          ></Input>
        </div>
        <div>
          <HasAccess requiredPermissions={["Account.Add"]}>
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
            {data?.pages.map((pageData) =>
              pageData.map((account) => {
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
              })
            )}
          </Tbody>
        </Table>
        <HasAccess requiredPermissions={["Account.Add"]}>
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
                  refetch();
                }}
              ></UploadArea>
            </Modal>
          )}
        </HasAccess>
      </Container>
    </>
  );
};
type UploadAreaProps = {
  refetch: () => void;
};
const UploadArea = ({ refetch }: UploadAreaProps) => {
  const { instance: msalInstance } = useMsal();
  const [numberOfUploadedFiles, setNumberOfUploadedFiles] = useState(0);
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
    uppy.on("file-added", addFile);
    uppy.on("file-removed", removeFile);

    uppy.on("upload-success", onSuccessUpload);
    return () => {
      uppy.off("upload-success", onSuccessUpload);
      uppy.off("file-added", addFile);
      uppy.off("file-removed", removeFile);
      uppy.cancelAll();
    };
  }, []);
  const importAccounts = async () => {
    const tokens = await msalInstance.acquireTokenSilent({
      scopes: [SCOPES.library.access],
    });
    uppy.getPlugin("XHRUpload")?.setOptions({
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    await uppy.upload();
  };

  return (
    <>
      <Dashboard
        uppy={uppy}
        hideUploadButton={true}
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
    </>
  );
};
export default AccountPage;
