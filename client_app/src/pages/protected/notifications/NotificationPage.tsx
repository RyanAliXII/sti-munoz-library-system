import { toReadableDatetime } from "@helpers/datetime";
import { useNotifications } from "@hooks/data-fetching/notification";
import { Table } from "flowbite-react";

import { Link } from "react-router-dom";

const NotificationPage = () => {
  const { data: notifications } = useNotifications();
  return (
    <div className="py-4 w-11/12 mx-auto lg:w-9/12">
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Message</Table.HeadCell>
            <Table.HeadCell>Created At</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {notifications?.map((n) => {
              return (
                <Table.Row key={n.id}>
                  <Table.Cell>
                    <Link
                      style={{
                        maxWidth: "400px",
                      }}
                      className={`py-5 rounded flex-col items-start ${
                        n.link.length === 0 ? "pointer-events-none" : ""
                      }`}
                      to={n.link}
                    >
                      {" "}
                      {n.message}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{toReadableDatetime(n.createdAt)}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default NotificationPage;
