import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";

import { ClientLog } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import { Table } from "flowbite-react";
import TimeAgo from "timeago-react";

const ClientLogPage = () => {
  const { Get } = useRequest();
  const fetchClientLogs = async () => {
    try {
      const { data: response } = await Get("/client-logs/");
      return response?.data?.clientLogs ?? [];
    } catch (error) {
      return [];
    }
  };
  const { data: clientLogs } = useQuery<ClientLog[]>({
    queryFn: fetchClientLogs,
    queryKey: ["clientLogs"],
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
      </LoadingBoundaryV2>
    </Container>
  );
};

export default ClientLogPage;
