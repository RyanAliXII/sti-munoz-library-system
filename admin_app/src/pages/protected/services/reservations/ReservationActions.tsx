import { ReservationStatus } from "@internal/reservation-status";
import { Button } from "flowbite-react";
import { FC } from "react";
import { ReservationTableRowProps } from "./ReservationPage";

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

  if (reservation.statusId === ReservationStatus.Attended) {
    return (
      <div className="flex gap-2">
        <Button color="warning" onClick={initMissed}>
          Missed
        </Button>
      </div>
    );
  }
  if (reservation.statusId === ReservationStatus.Missed) {
    return (
      <div className="flex gap-2">
        <Button color="success" onClick={initAttended}>
          Attended
        </Button>
      </div>
    );
  }
  return null;
};
export default ReservationActions;
