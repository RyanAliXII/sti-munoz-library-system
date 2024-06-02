import HasAccess from "@components/auth/HasAccess";
import CustomPagination from "@components/pagination/CustomPagination";
import Container from "@components/ui/container/Container";
import CustomSelect from "@components/ui/form/CustomSelect";
import TableContainer from "@components/ui/table/TableContainer";
import { BorrowRequest } from "@definitions/types";
import { toReadableDate, toReadableDatetime } from "@helpers/datetime";
import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { STATUSES_OPTIONS } from "@internal/borrow-status";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
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
import { AiOutlineCheckCircle, AiOutlineWarning } from "react-icons/ai";
import { BiErrorAlt } from "react-icons/bi";
import { MdFilterList } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { MultiValue } from "react-select";
import { useSearchParamsState } from "react-use-search-params-state";
import ExportBorrowedBookModal from "./ExportBorrowedBookModal";
import ReturnScanModal from "./ReturnScanModal";

const BorrowRequestPage = () => {
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useSearchParamsState({
    page: { default: 1, type: "number" },
    from: { default: "", type: "string" },
    to: { default: "", type: "string" },
    keyword: { default: "", type: "string" },
    statuses: { default: "", type: "number", multiple: true },
    sortBy: { default: "dateCreated", type: "string" },
    order: { default: "desc", type: "string" },
  });
  const { Get } = useRequest();
  const fetchTransactions = async () => {
    try {
      const { data: response } = await Get("/borrowing/requests", {
        params: {
          page: filters?.page ?? 1,
          from: filters?.from ?? "",
          to: filters?.to ?? "",
          keyword: filters?.keyword ?? "",
          statuses: filters?.statuses ?? [],
          sortBy: filters?.sortBy ?? "dateCreated",
          order: filters?.order ?? "desc",
        },
      });
      setPages(response?.data?.metadata?.pages ?? 1);
      return response?.data?.borrowRequests ?? [];
    } catch {
      return [];
    }
  };

  const { data: requests } = useQuery<BorrowRequest[]>({
    queryFn: fetchTransactions,
    queryKey: ["transactions", filters],
  });

  const navigate = useNavigate();
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
      statuses: [],
      sortBy: "dateCreated",
      order: "desc",
    });
  };
  const debounceSearch = useDebounce();
  const search = (q: any) => {
    setFilters({ page: 1, keyword: q });
  };
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    debounceSearch(search, event.target.value, 500);
  };
  const handleStatusSelect = (
    values: MultiValue<{ value: number; label: string }>
  ) => {
    setFilters({
      statuses: values.map((t) => t.value),
      page: 1,
    });
  };
  const handleSortBySelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFilters({
      sortBy: value,
    });
  };
  const handleOrderSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilters({
      order: value,
    });
  };
  const returnScanModal = useSwitch();
  const exportModal = useSwitch();
  return (
    <>
      <Container>
        <div className="py-5">
          <div className="py-3 flex justify-between items-center">
            <div className="flex gap-2">
              <TextInput
                placeholder="Search by account"
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
                <div className="p-2">
                  <Label>Status</Label>
                  <CustomSelect
                    options={STATUSES_OPTIONS}
                    isMulti={true}
                    onChange={handleStatusSelect}
                    value={STATUSES_OPTIONS.filter((s) =>
                      filters.statuses.includes(s.value)
                    )}
                    placeholder="Select User Type"
                  />
                </div>
                <div className="p-2">
                  <Label>Sort by</Label>
                  <Select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleSortBySelect}
                  >
                    <option value="dateCreated">Date Created</option>
                    <option value="givenName">Given name</option>
                    <option value="surname">Surname</option>
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
                        checked={filters.order === "asc"}
                      />
                      <Label>Ascending</Label>
                    </div>
                    <div className="flex gap-1 items-center mt-1">
                      <Radio
                        name="order"
                        value="desc"
                        color="primary"
                        onChange={handleOrderSelect}
                        checked={filters.order === "desc"}
                      />
                      <Label>Descending</Label>
                    </div>
                  </div>
                </div>
                <Button
                  color="primary"
                  className="w-full"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Dropdown>
            </div>
            <div className="flex gap-2">
              <HasAccess requiredPermissions={["BorrowedBook.Add"]}>
                <Button color="primary" to="/borrowing/checkout" as={Link}>
                  Checkout Book
                </Button>
              </HasAccess>
              <HasAccess requiredPermissions={["BorrowedBook.Edit"]}>
                <Button onClick={returnScanModal.open}>Scan and Return</Button>
              </HasAccess>
              <HasAccess requiredPermissions={["BorrowedBook.Read"]}>
                <Button outline color="primary" onClick={exportModal.open}>
                  Export
                </Button>
              </HasAccess>
            </div>
          </div>
        </div>
        <TableContainer>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Patron</Table.HeadCell>
              <Table.HeadCell>Created At</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y dark:divide-gray-700">
              {requests?.map((request) => {
                return (
                  <Table.Row
                    key={request.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/borrowing/requests/${request.id}`)
                    }
                  >
                    <Table.Cell className="font-semibold text-gray-900 dark:text-gray-50">
                      <div className="font-semibold">
                        {request.client.displayName}
                      </div>
                      <div className="text-sm text-gray-500 ">
                        {request.client.email}
                      </div>
                    </Table.Cell>

                    <Table.Cell>
                      {toReadableDatetime(request.createdAt)}
                    </Table.Cell>
                    <Table.Cell>
                      <RequiresAttentionText request={request} />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
          <div className="py-5">
            <CustomPagination
              pageCount={pages}
              isHidden={pages <= 1}
              forcePage={filters?.page - 1 ?? 1}
              onPageChange={({ selected }) => {
                setFilters({ page: selected + 1 });
              }}
            />
          </div>
        </TableContainer>

        <ReturnScanModal
          closeModal={returnScanModal.close}
          isOpen={returnScanModal.isOpen}
        />
        <ExportBorrowedBookModal
          filters={filters}
          closeModal={exportModal.close}
          isOpen={exportModal.isOpen}
        />
      </Container>
    </>
  );
};
export const RequiresAttentionText = ({
  request,
}: {
  request: BorrowRequest;
}) => {
  if (request.totalPenalty > 0) {
    return (
      <div className="text-red-400 flex items-center gap-1 font-bold">
        <BiErrorAlt className="text-lg" />
        <span>
          Client is past due. Penalty: PHP {""}
          {request.totalPenalty.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
        </span>
      </div>
    );
  }
  if (request.totalPending > 0) {
    return (
      <div className="font-bold flex items-center gap-1">
        <AiOutlineWarning className="text-lg" />
        <span>You have {request.totalPending} pending requests.</span>
      </div>
    );
  }
  if (request.totalApproved > 0) {
    return (
      <div className="font-bold flex items-center gap-1 text-blue-500">
        <AiOutlineWarning className="text-lg" />
        <span>You have approved {request.totalApproved} requests.</span>
      </div>
    );
  }
  if (request.totalCheckedOut > 0) {
    return (
      <div className="font-bold flex items-center gap-1 text-green-500">
        <AiOutlineCheckCircle className="text-lg" />
        <span>{request.totalCheckedOut} books have been checked out.</span>
      </div>
    );
  }
  return null;
};
export default BorrowRequestPage;
