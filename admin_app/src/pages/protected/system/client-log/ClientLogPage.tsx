import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import CustomPagination from "@components/pagination/CustomPagination";
import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";

import { ClientLog } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import pages from "@pages/Pages";
import { useQuery } from "@tanstack/react-query";
import { Table } from "flowbite-react";
import { useState } from "react";
import { useSearchParamsState } from "react-use-search-params-state";
import TimeAgo from "timeago-react";

const ClientLogPage = () => {
  const { Get } = useRequest();

  const [totalPages, setTotalPages] = useState(1);
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { default: 1, type: "number" },
  });
  const fetchClientLogs = async () => {
    try {
      const { data: response } = await Get("/client-logs/", {
        params: {
          page: filterParams?.page ?? 1,
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
  return (
    <Container>
      <LoadingBoundaryV2 isError={false} isLoading={false}>
        <TableContainer>
          <Table>
            <Table.Head>
              <Table.HeadCell>Created At</Table.HeadCell>
              <Table.HeadCell>Client</Table.HeadCell>
              <Table.HeadCell>Scanner</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y dark:divide-gray-700">
              {clientLogs?.map((log) => {
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
                    <Table.Cell>{log.client.displayName}</Table.Cell>
                    <Table.Cell>
                      {log.scanner.username} - {log.scanner.description}
                    </Table.Cell>
                    <Table.Cell>
                      <TimeAgo datetime={log.createdAt} />
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
