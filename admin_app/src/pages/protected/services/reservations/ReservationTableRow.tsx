import { to12HR, toReadableDate, toReadableDatetime } from "@helpers/datetime";
import { ReservationStatus } from "@internal/reservation-status";
import { Badge, Table } from "flowbite-react";
import { FC } from "react";
import { ReservationTableRowProps } from "./ReservationPage";
import ReservationActions from "./ReservationActions";

const ReservationTableRow: FC<ReservationTableRowProps> = ({
  reservation,
  cancelConfirm,
  attendedConfrm,
  missedConfirm,
  editRemarksModal,
  setReservation,
}) => {
  let badgeColor = "";

  switch (reservation.statusId) {
    case ReservationStatus.Pending:
      badgeColor = "primary";
      break;
    case ReservationStatus.Attended:
      badgeColor = "success";
      break;
    case ReservationStatus.Missed:
      badgeColor = "warning";
      break;
    case ReservationStatus.Cancelled:
      badgeColor = "failure";
      break;
  }

  return (
    <Table.Row>
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
        {reservation.remarks.length === 0 ? "N/A" : reservation.remarks}
      </Table.Cell>
      <Table.Cell>
        <ReservationActions
          editRemarksModal={editRemarksModal}
          setReservation={setReservation}
          attendedConfrm={attendedConfrm}
          missedConfirm={missedConfirm}
          reservation={reservation}
          cancelConfirm={cancelConfirm}
        />
      </Table.Cell>
    </Table.Row>
  );
};

export default ReservationTableRow;
