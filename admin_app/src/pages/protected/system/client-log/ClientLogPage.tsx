import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import CustomPagination from "@components/pagination/CustomPagination";
import Container from "@components/ui/container/Container";
import CustomSelect from "@components/ui/form/CustomSelect";
import TableContainer from "@components/ui/table/TableContainer";
import { ClientLog, UserProgramOrStrand, UserType } from "@definitions/types";
import { buildAvatar } from "@helpers/avatar";
import { toReadableDate, toReadableDatetime } from "@helpers/datetime";
import { useUserPrograms, useUserTypes } from "@hooks/data-fetching/user";
import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Avatar,
  Button,
  Datepicker,
  Dropdown,
  Label,
  Radio,
  Select,
  Table,
  TextInput,
} from "flowbite-react";
import { ChangeEvent, useState } from "react";
import { MdFilterList } from "react-icons/md";
import { MultiValue } from "react-select";
import { useSearchParamsState } from "react-use-search-params-state";
import ExportModal from "./ExportModal";

const ClientLogPage = () => {
  const { Get } = useRequest();

  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { default: 1, type: "number" },
    from: { default: "", type: "string" },
    to: { default: "", type: "string" },
    keyword: { default: "", type: "string" },
    userTypes: { default: [], type: "string", multiple: true },
    userPrograms: { default: [], type: "string", multiple: true },
    sortBy: { default: "dateCreated", type: "string" },
    order: { default: "desc", type: "string" },
  });
  const fetchClientLogs = async () => {
    try {
      const { data: response } = await Get("/client-logs/", {
        params: {
          page: filterParams?.page ?? 1,
          from: filterParams?.from ?? "",
          to: filterParams?.to ?? "",
          keyword: filterParams?.keyword ?? "",
          userTypes: filterParams?.userTypes ?? [],
          userPrograms: filterParams?.userPrograms ?? [],
          sortBy: filterParams?.sortBy ?? "dateCreated",
          order: filterParams?.order ?? "desc",
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
      keyword: "",
      userTypes: [],
      page: 1,
      userPrograms: [],
      sortBy: "dateCreated",
      order: "desc",
    });
  };

  const debounceSearch = useDebounce();
  const search = (q: any) => {
    setFilterParams({ page: 1, keyword: q });
  };
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    debounceSearch(search, event.target.value, 500);
  };
  const { data: userTypes } = useUserTypes({});
  const { data: userPrograms } = useUserPrograms({});
  const handleUserTypeSelect = (values: MultiValue<UserType>) => {
    setFilterParams({
      userTypes: values.map((t) => t.id),
      page: 1,
    });
  };
  const handleUserProgramSelect = (values: MultiValue<UserProgramOrStrand>) => {
    setFilterParams({
      userPrograms: values.map((t) => t.id),
      page: 1,
    });
  };
  const handleSortBySelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFilterParams({
      sortBy: value,
    });
  };
  const handleOrderSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterParams({
      order: value,
    });
  };
  const exportModal = useSwitch();
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
          <div className="p-2">
            <Label>Patron Type</Label>
            <CustomSelect
              options={userTypes ?? []}
              isMulti={true}
              onChange={handleUserTypeSelect}
              value={userTypes?.filter((c) =>
                filterParams?.userTypes.includes(c.id?.toString())
              )}
              getOptionLabel={(opt) => opt.name}
              getOptionValue={(opt) => opt.id?.toString() ?? ""}
              placeholder="Select User Type"
            />
          </div>
          <div className="p-2">
            <Label>Patron Program</Label>
            <CustomSelect
              onChange={handleUserProgramSelect}
              options={userPrograms ?? []}
              isMulti={true}
              value={userPrograms?.filter((c) =>
                filterParams?.userPrograms.includes(c.id.toString())
              )}
              getOptionLabel={(opt) => opt.code}
              getOptionValue={(opt) => opt.id?.toString() ?? ""}
              placeholder="Select User Program"
            />
          </div>
          <div className="p-2">
            <Label>Sort by</Label>
            <Select
              name="sortBy"
              value={filterParams.sortBy}
              onChange={handleSortBySelect}
            >
              <option value="dateCreated">Date Created</option>
              <option value="givenName">Given name</option>
              <option value="surname">Surname</option>
              <option value="scanner">Scanner</option>
            </Select>
          </div>

          <div className="pb-3 px-2">
            <Label>Order</Label>
            <div className="flex flex-col">
              <div className="flex gap-1 items-center mt-1">
                <Radio
                  name="order"
                  value="asc"
                  onChange={handleOrderSelect}
                  color="primary"
                  checked={filterParams.order === "asc"}
                />
                <Label>Ascending</Label>
              </div>
              <div className="flex gap-1 items-center mt-1">
                <Radio
                  name="order"
                  value="desc"
                  color="primary"
                  onChange={handleOrderSelect}
                  checked={filterParams.order === "desc"}
                />
                <Label>Descending</Label>
              </div>
            </div>
          </div>

          <Button color="primary" className="w-full" onClick={handleReset}>
            Reset
          </Button>
        </Dropdown>
        <Button color="primary" onClick={exportModal.open}>
          Export
        </Button>
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
      <ExportModal
        closeModal={exportModal.close}
        isOpen={exportModal.isOpen}
        filters={filterParams}
      />
    </Container>
  );
};

export default ClientLogPage;
