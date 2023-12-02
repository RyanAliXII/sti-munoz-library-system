import { useQuery } from "@tanstack/react-query";

import Container from "@components/ui/container/Container";
import { BorrowRequest } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useNavigate } from "react-router-dom";

import { AiOutlineCheckCircle, AiOutlineWarning } from "react-icons/ai";
import { BiErrorAlt } from "react-icons/bi";
import TimeAgo from "timeago-react";
import { Table } from "flowbite-react";
import { toReadableDatetime } from "@helpers/datetime";
import TableContainer from "@components/ui/table/TableContainer";

const BorrowRequestPage = () => {
  const { Get } = useRequest();
  const fetchTransactions = async () => {
    try {
      const { data: response } = await Get("/borrowing/requests", {});

      return response?.data?.borrowRequests ?? [];
    } catch {
      return [];
    }
  };
  const { data: requests } = useQuery<BorrowRequest[]>({
    queryFn: fetchTransactions,
    queryKey: ["transactions"],
  });
  const navigate = useNavigate();
  return (
    <>
      <Container>
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
