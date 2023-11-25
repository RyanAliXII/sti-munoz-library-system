import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useReservations } from "@hooks/data-fetching/reservation";
import { Badge, Button, Table } from "flowbite-react";
import { to12HR, toReadableDate, toReadableDatetime } from "@helpers/datetime";
import { Reservation } from "@definitions/types";
import React, { FC, useState } from "react";
import { ReservationStatus } from "@internal/reservation-status";
import {
  ConfirmDialog,
  DangerConfirmDialog,
  PromptTextAreaDialog,
  WarningConfirmDialog,
} from "@components/ui/dialog/Dialog";
import { UseSwitchFunc, useSwitch } from "@hooks/useToggle";

type UndetailedReservation = Omit<
  Reservation,
  "client" | "dateSlot" | "timeSlot" | "device" | "createdAt"
>;
const ReservationPage = () => {
  const { data: reservations } = useReservations({});
  const cancelConfirm = useSwitch();
  const missedConfirm = useSwitch();
  const attendedConfirm = useSwitch();
  const [reservation, setReservation] = useState<UndetailedReservation>({
    accountId: "",
    dateSlotId: "",
    deviceId: "",
    id: "",
    status: "",
    statusId: 0,
    timeSlotId: "",
  });
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
              return (
                <ReservationTableRow
                  setReservation={setReservation}
                  reservation={reservation}
                  attendedConfrm={attendedConfirm}
                  missedConfirm={missedConfirm}
                  cancelConfirm={cancelConfirm}
                />
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
      {/* <DangerConfirmDialog
        title="Cancel Reservation"
        text="Are you sure you want to cancel reservation?"
        close={cancelConfirm.close}
        isOpen={cancelConfirm.isOpen}
      /> */}
      <PromptTextAreaDialog
        close={cancelConfirm.close}
        isOpen={cancelConfirm.isOpen}
        label="Cancellation remarks"
        placeholder="it can be cancellations reasons."
        proceedBtnText="Save"
        title="Cancel Reservation"
        submitButtonsProps={{
          color: "failure",
        }}
      />
      <WarningConfirmDialog
        title="Mark as missed"
        text="Are you sure you want to mark reservation as missed?"
        close={missedConfirm.close}
        isOpen={missedConfirm.isOpen}
      />
      <ConfirmDialog
        title="Mark as attended"
        text="Are you sure you want to mark reservation as attended?"
        close={attendedConfirm.close}
        isOpen={attendedConfirm.isOpen}
      />
    </Container>
  );
};

type ReservationTableRowProps = {
  reservation: Reservation;
  cancelConfirm: UseSwitchFunc;
  missedConfirm: UseSwitchFunc;
  attendedConfrm: UseSwitchFunc;
  setReservation: React.Dispatch<UndetailedReservation>;
};
const ReservationTableRow: FC<ReservationTableRowProps> = ({
  reservation,
  cancelConfirm,
  attendedConfrm,
  missedConfirm,
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
        <ReservationActions
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

const ReservationActions: FC<ReservationTableRowProps> = ({
  reservation,
  setReservation,
  attendedConfrm,
  cancelConfirm,
  missedConfirm,
}) => {
  const initAttended = () => {
    setReservation(reservation);
    attendedConfrm.open();
  };
  const initCancellation = () => {
    setReservation(reservation);
    cancelConfirm.open();
  };
  const initMissed = () => {
    setReservation(reservation);
    missedConfirm.open();
  };
  if (reservation.statusId === ReservationStatus.Pending) {
    return (
      <div className="flex gap-2">
        <Button color="success" onClick={initAttended}>
          Attended
        </Button>
        <Button color="warning" onClick={initMissed}>
          Missed
        </Button>
        <Button color="failure" onClick={initCancellation}>
          Cancel
        </Button>
      </div>
    );
  }

  return null;
};

export default ReservationPage;
