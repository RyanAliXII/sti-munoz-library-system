import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import CustomPagination from "@components/pagination/CustomPagination";
import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { ClientLog } from "@definitions/types";
import { buildAvatar } from "@helpers/avatar";
import { toReadableDate, toReadableDatetime } from "@helpers/datetime";
import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Avatar,
  Button,
  Datepicker,
  Dropdown,
  Label,
  Table,
} from "flowbite-react";
import { TextInput } from "flowbite-react";
import { ChangeEvent, useState } from "react";
import { MdFilterList } from "react-icons/md";
import { useSearchParamsState } from "react-use-search-params-state";
import TimeAgo from "timeago-react";

const ClientLogPage = () => {
  const { Get } = useRequest();

  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { default: 1, type: "number" },
    from: { default: "", type: "string" },
    to: { default: "", type: "string" },
    keyword: { default: "", type: "string" },
  });
  const fetchClientLogs = async () => {
    try {
      const { data: response } = await Get("/client-logs/", {
        params: {
          page: filterParams?.page ?? 1,
          from: filterParams?.from ?? "",
          to: filterParams?.to ?? "",
          keyword: filterParams?.keyword ?? "",
        },
      });
      const { data } = response;
      if (data?.metadata) {
        setTotalPages(data?.metadata?.pages ?? 1);
      }
      return data?.clientLogs ?? [];
    } catch (error) {
      return [];
    }
  };
  const { data: clientLogs } = useQuery<ClientLog[]>({
    queryFn: fetchClientLogs,
    queryKey: ["clientLogs", filterParams],
  });
  const handleFrom = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setFilterParams({
      from: dateStr,
      page: 1,
    });
  };
  const handleTo = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setFilterParams({
      to: dateStr,
      page: 1,
    });
  };
  const handleReset = () => {
    setFilterParams({
      from: "",
      to: "",
    });
  };

  const debounceSearch = useDebounce();
  const search = (q: any) => {
    setFilterParams({ page: 1, keyword: q });
  };
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    debounceSearch(search, event.target.value, 500);
  };
  return (
    <Container>
      <div className="py-3 flex gap-2">
        <TextInput placeholder="Search by account" onChange={handleSearch} />
        <Dropdown
          color="light"
          arrowIcon={false}
          className="py-2 p-3"
          label={<MdFilterList className="text-lg" />}
        >
          <div className="p-2 flex flex-col gap-2 ">
            <Label>From</Label>
            <Datepicker
              value={toReadableDate(filterParams?.from)}
              onSelectedDateChanged={handleFrom}
            />
          </div>
          <div className="p-2 flex flex-col">
            <Label className="block">To</Label>
            <Datepicker
              value={toReadableDate(filterParams?.to)}
              onSelectedDateChanged={handleTo}
            />
          </div>
          <Button color="primary" className="w-full" onClick={handleReset}>
            Reset
          </Button>
        </Dropdown>
      </div>
      <LoadingBoundaryV2 isError={false} isLoading={false}>
        <TableContainer>
          <Table>
            <Table.Head>
              <Table.HeadCell>Created At</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
              <Table.HeadCell>Client</Table.HeadCell>
              <Table.HeadCell>User Group</Table.HeadCell>
              <Table.HeadCell>Scanner</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y dark:divide-gray-700">
              {clientLogs?.map((log) => {
                const avatarUrl = buildAvatar(log.client);
                return (
                  <Table.Row key={log.id}>
                    <Table.Cell>{toReadableDatetime(log.createdAt)}</Table.Cell>
                    <Table.Cell>
                      <div className="h-10">
                        <Avatar img={avatarUrl} rounded></Avatar>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {log.client.givenName} {log.client.surname}
                      </div>
                      <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {log.client.studentNumber}
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {log.client.userType}
                      </div>
                      <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {log.client.programCode}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {log.scanner.description}
                      </div>
                      <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {log.scanner.username}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </TableContainer>
        <div className="py-5">
          <CustomPagination
            isHidden={totalPages <= 1}
            pageCount={totalPages}
            forcePage={filterParams?.page - 1}
            onPageChange={({ selected }) => {
              setFilterParams({
                page: selected + 1,
              });
            }}
          />
        </div>
      </LoadingBoundaryV2>
    </Container>
  );
};

export default ClientLogPage;
