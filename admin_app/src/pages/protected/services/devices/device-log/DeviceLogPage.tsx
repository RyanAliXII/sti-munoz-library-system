import HasAccess from "@components/auth/HasAccess";
import Container from "@components/ui/container/Container";
import { ConfirmDialog } from "@components/ui/dialog/Dialog";
import TableContainer from "@components/ui/table/TableContainer";
import { toReadableDate, toReadableDatetime } from "@helpers/datetime";
import { useDeviceLogout, useDeviceLogs } from "@hooks/data-fetching/device";
import { useSwitch } from "@hooks/useToggle";
import {
  Button,
  Datepicker,
  Dropdown,
  Label,
  Table,
  TextInput,
} from "flowbite-react";
import { ChangeEvent, useState } from "react";
import { MdFilterList, MdLogout } from "react-icons/md";
import { useSearchParamsState } from "react-use-search-params-state";
import NewDeviceLogModal from "./NewDeviceLogModal";
import { DeviceLog } from "@definitions/types";
import { AccountInitialValue } from "@definitions/defaults";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import useDebounce from "@hooks/useDebounce";
import { format } from "date-fns";
import CustomPagination from "@components/pagination/CustomPagination";

const DeviceLogPage = () => {
  const logModal = useSwitch();
  const [deviceLog, setDeviceLog] = useState<DeviceLog>({
    accountId: "",
    client: AccountInitialValue,
    createdAt: "",
    device: {
      available: 0,
      description: "",
      id: "",
      name: "",
    },
    deviceId: "",
    id: "",
    isLoggedOut: false,
    loggedOutAt: "",
  });
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useSearchParamsState({
    page: { default: 1, type: "number" },
    from: { default: "", type: "string" },
    to: { default: "", type: "string" },
    keyword: { default: "", type: "string" },
  });
  const { data: deviceLogsData } = useDeviceLogs({
    queryKey: [
      "deviceLogs",
      {
        from: filters?.from ?? "",
        to: filters?.to ?? "",
        keyword: filters?.keyword,
        page: filters?.page ?? 0,
      },
    ],
    onSuccess: (deviceLogData) => {
      setPages(deviceLogData.metadata.pages ?? 1);
    },
  });
  const queryClient = useQueryClient();
  const confirmLogout = useSwitch();
  const initLogout = (log: DeviceLog) => {
    confirmLogout.open();
    setDeviceLog(log);
  };
  const logout = useDeviceLogout({
    onSuccess: () => {
      queryClient.invalidateQueries(["deviceLogs"]);
      toast.success("Patron Logged Out");
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onConfirmLogout = () => {
    logout.mutate(deviceLog.id);
    confirmLogout.close();
  };

  const handleFrom = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setFilters({
      from: dateStr,
      page: 1,
    });
  };
  const handleTo = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setFilters({
      to: dateStr,
      page: 1,
    });
  };
  const handleReset = () => {
    setFilters({
      from: "",
      to: "",
    });
  };
  const debounceSearch = useDebounce();
  const search = (q: any) => {
    setFilters({ page: 1, keyword: q });
  };
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    debounceSearch(search, event.target.value, 500);
  };

  return (
    <Container>
      <div className="py-5">
        <div className="py-3 flex justify-between items-center">
          <div className="flex gap-2">
            <TextInput
              placeholder="Search by account or game"
              onChange={handleSearch}
            />
            <Dropdown
              color="light"
              arrowIcon={false}
              className="py-2 p-3"
              label={<MdFilterList className="text-lg" />}
            >
              <div className="p-2 flex flex-col gap-2 ">
                <Label>From</Label>
                <Datepicker
                  value={toReadableDate(filters.from)}
                  onSelectedDateChanged={handleFrom}
                />
              </div>
              <div className="p-2 flex flex-col">
                <Label className="block">To</Label>
                <Datepicker
                  value={toReadableDate(filters?.to)}
                  onSelectedDateChanged={handleTo}
                />
              </div>
              <Button color="primary" className="w-full" onClick={handleReset}>
                Reset
              </Button>
            </Dropdown>
          </div>
          <HasAccess>
            <Button color="primary" onClick={logModal.open}>
              Log Device
            </Button>
          </HasAccess>
        </div>
      </div>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Logged In</Table.HeadCell>
            <Table.HeadCell>Logged Out</Table.HeadCell>
            <Table.HeadCell>Device</Table.HeadCell>
            <Table.HeadCell>Patron</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {deviceLogsData?.deviceLogs?.map((log) => {
              return (
                <Table.Row key={log.id}>
                  <Table.Cell>
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Table.Cell>
                  <Table.Cell>
                    {log.isLoggedOut ? (
                      toReadableDatetime(log.loggedOutAt)
                    ) : (
                      <span className="text-yellow-500">Not Logged Out</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {log.device.name}
                    </div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {log.device.description}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {log.client.givenName} {log.client.surname}
                    </div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {log.client.email}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      {!log.isLoggedOut && (
                        <Button
                          color="primary"
                          onClick={() => {
                            initLogout(log);
                          }}
                        >
                          <MdLogout />
                          Log Out
                        </Button>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        <CustomPagination
          pageCount={pages}
          isHidden={pages <= 1}
          forcePage={filters?.page - 1 ?? 0}
          onPageChange={({ selected }) => {
            setFilters({
              page: selected + 1,
            });
          }}
        />
      </TableContainer>
      <NewDeviceLogModal closeModal={logModal.close} isOpen={logModal.isOpen} />
      <ConfirmDialog
        close={confirmLogout.close}
        isOpen={confirmLogout.isOpen}
        title="Logout"
        onConfirm={onConfirmLogout}
        text="Are you sure that you want to mark this as logged out?"
      />
    </Container>
  );
};

export default DeviceLogPage;
