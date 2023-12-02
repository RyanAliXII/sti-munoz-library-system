import { useQuery } from "@tanstack/react-query";
import Container from "@components/ui/container/Container";
import { BorrowRequest } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useNavigate, useSearchParams } from "react-router-dom";
import TableContainer from "@components/ui/table/TableContainer";
import { toReadableDate, toReadableDatetime } from "@helpers/datetime";
import {
  Button,
  Datepicker,
  Dropdown,
  Label,
  Table,
  TextInput,
} from "flowbite-react";
import { AiOutlineCheckCircle, AiOutlineWarning } from "react-icons/ai";
import { BiErrorAlt } from "react-icons/bi";
import { useSearchParamsState } from "react-use-search-params-state";
import { ChangeEvent, useState } from "react";
import CustomPagination from "@components/pagination/CustomPagination";
import { format } from "date-fns";
import useDebounce from "@hooks/useDebounce";
import { MdFilterList } from "react-icons/md";

const BorrowRequestPage = () => {
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useSearchParamsState({
    page: { default: 1, type: "number" },
    from: { default: "", type: "string" },
    to: { default: "", type: "string" },
    keyword: { default: "", type: "string" },
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
                <Button
                  color="primary"
                  className="w-full"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Dropdown>
            </div>

            <Button color="primary">Log Game</Button>
          </div>
        </div>
        <TableContainer>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Client</Table.HeadCell>
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
