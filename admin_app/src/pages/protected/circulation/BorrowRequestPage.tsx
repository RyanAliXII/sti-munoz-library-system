import {
  Thead,
  Table,
  BodyRow,
  HeadingRow,
  Tbody,
  Td,
  Th,
} from "@components/ui/table/Table";

import { useQuery } from "@tanstack/react-query";

import { BorrowRequest } from "@definitions/types";
import { useNavigate } from "react-router-dom";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import { useRequest } from "@hooks/useRequest";

import TimeAgo from "timeago-react";
import { BiErrorAlt } from "react-icons/bi";
import { AiOutlineCheckCircle, AiOutlineWarning } from "react-icons/ai";

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
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">Borrow Requests</h1>
      </ContainerNoBackground>

      <Container>
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Created At</Th>
              <Th>Client</Th>
              <Th></Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {requests?.map((request) => {
              return (
                <BodyRow
                  key={request.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/borrowing/requests/${request.id}`)}
                >
                  <Td>
                    <TimeAgo datetime={request.createdAt} />
                  </Td>
                  <Td>{request.client.displayName}</Td>
                  <Td>
                    <RequiresAttentionText request={request} />
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
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
