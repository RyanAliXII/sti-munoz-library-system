import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { ClientLog } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
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
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10">
      <div className="w-full flex  mb-5">
        <h1 className="text-2xl">Client Logs</h1>
      </div>

      <div>
        <LoadingBoundaryV2 isError={false} isLoading={false}>
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Created At</Th>
                <Th>Client</Th>
                <Th>Scanner</Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {clientLogs?.map((log) => {
                return (
                  <BodyRow key={log.id}>
                    <Td>
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: "long",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
                    <Td>{log.client.displayName}</Td>
                    <Td>
                      {log.scanner.username} - {log.scanner.description}
                    </Td>
                    <Td>
                      <TimeAgo datetime={log.createdAt} />
                    </Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </LoadingBoundaryV2>
      </div>
    </div>
  );
};

export default ClientLogPage;
