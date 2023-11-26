import { ReservationStatus } from "@internal/reservation-status";
import { FC } from "react";

type StatusBadgeProps = {
  status: string;
  statusId: number;
};
const StatusBadge: FC<StatusBadgeProps> = ({ status, statusId }) => {
  let badgeClass = "";

  switch (statusId) {
    case ReservationStatus.Attended:
      badgeClass = "badge badge-success font-semibold";
      break;
    case ReservationStatus.Missed:
      badgeClass = "badge badge-warning font-semibold";
      break;
    case ReservationStatus.Cancelled:
      badgeClass = "badge badge-error font-semibold";
      break;
    default:
      badgeClass = "badge badge-primary font-semibold";
  }

  return <div className={badgeClass}>{status}</div>;
};

export default StatusBadge;
