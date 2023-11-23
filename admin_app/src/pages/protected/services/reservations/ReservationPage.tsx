import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useReservations } from "@hooks/data-fetching/reservation";
import { Table } from "flowbite-react";
import { to12HR, toReadableDate, toReadableDatetime } from "@helpers/datetime";

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
          </Table.Head>
          <Table.Body>
            {reservations?.map((reservation) => {
              return (
                <Table.Row key={reservation.id}>
                  <Table.Cell>
                    {toReadableDatetime(reservation.createdAt)}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {reservation.client.givenName}{" "}
                      {reservation.client.surname}
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
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ReservationPage;
