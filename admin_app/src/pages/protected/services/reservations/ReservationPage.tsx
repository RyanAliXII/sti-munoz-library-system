import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useReservations } from "@hooks/data-fetching/reservation";
import { Badge, Button, Table } from "flowbite-react";
import { to12HR, toReadableDate, toReadableDatetime } from "@helpers/datetime";
import { Reservation } from "@definitions/types";
import { FC } from "react";
import { ReservationStatus } from "@internal/reservation-status";

const ReservationPage = () => {
  const { data: reservations } = useReservations({});
  return (
    <Container>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Created At</Table.HeadCell>
            <Table.HeadCell>Client</Table.HeadCell>
            <Table.HeadCell>Device</Table.HeadCell>
            <Table.HeadCell>Reservation Date</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {reservations?.map((reservation) => {
              return <ReservationTableRow reservation={reservation} />;
            })}
          </Table.Body>
        </Table>
      </TableContainer>
    </Container>
  );
};

type ReservationTableRowProps = {
  reservation: Reservation;
};
const ReservationTableRow: FC<ReservationTableRowProps> = ({ reservation }) => {
  let badgeColor = "";

  switch (reservation.statusId) {
    case ReservationStatus.Pending:
      badgeColor = "primary";
      break;
    case ReservationStatus.Fulfilled:
      badgeColor = "success";
      break;
    case ReservationStatus.Unfulfilled:
      badgeColor = "warning";
      break;
    case ReservationStatus.Cancelled:
      badgeColor = "failure";
      break;
  }

  return (
    <Table.Row key={reservation.id}>
      <Table.Cell>{toReadableDatetime(reservation.createdAt)}</Table.Cell>
      <Table.Cell>
        <div className="text-base font-semibold text-gray-900 dark:text-white">
          {reservation.client.givenName} {reservation.client.surname}
        </div>
        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {reservation.client.email}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="text-base font-semibold text-gray-900 dark:text-white">
          {reservation.device.name}
        </div>
        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {reservation.device.description}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="text-base font-semibold text-gray-900 dark:text-white">
          {toReadableDate(reservation.dateSlot.date)}
        </div>
        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
          {`${to12HR(reservation.timeSlot.startTime)} to  ${to12HR(
            reservation.timeSlot.endTime
          )}`}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge color={badgeColor}>{reservation.status}</Badge>
          </div>
        </div>
      </Table.Cell>
      <Table.Cell>
        <ReservationActions reservation={reservation} />
      </Table.Cell>
    </Table.Row>
  );
};

const ReservationActions: FC<ReservationTableRowProps> = ({ reservation }) => {
  if (reservation.statusId === ReservationStatus.Pending) {
    return (
      <div className="flex gap-2">
        <Button color="success">Fulfilled</Button>
        <Button color="warning">Unfulfilled</Button>
        <Button color="failure">Cancelled</Button>
      </div>
    );
  }

  return null;
};

export default ReservationPage;
