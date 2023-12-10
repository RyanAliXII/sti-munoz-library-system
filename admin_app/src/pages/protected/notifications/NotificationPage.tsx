import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useNotifications } from "@hooks/data-fetching/notification";
import { Table } from "flowbite-react";

const NotificationPage = () => {
  const { data: notifications } = useNotifications();
  return (
    <Container>
      <h1 className="text-gray-900 dark:text-gray-50 text-2xl mt-2">
        Notifications
      </h1>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Message</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {notifications?.map((n) => {
              return (
                <Table.Row key={n.id}>
                  <Table.Cell>{n.message}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default NotificationPage;
