import { to12HR, toReadableDate } from "@helpers/datetime";
import { useReservations } from "@hooks/data-fetching/reservation";
import { ReservationStatus } from "@internal/reservation-status";
import { FC } from "react";
import { FaTimes } from "react-icons/fa";

const ReservationList = () => {
  const { data: reservations } = useReservations({});
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Device</th>
            <th>Reservation Date</th>
            <th>Status</th>
            <th>Remarks</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reservations?.map((reservation) => {
            return (
              <tr key={reservation.id}>
                <td>
                  <div className="font-semibold">{reservation.device.name}</div>
                  <div className="text-sm">
                    {" "}
                    {reservation.device.description}
                  </div>
                </td>
                <td>
                  <div className="font-semibold">
                    {toReadableDate(reservation.dateSlot.date)}
                  </div>
                  <div className="text-sm">
                    {`${to12HR(reservation.timeSlot.startTime)} to ${to12HR(
                      reservation.timeSlot.endTime
                    )}`}
                  </div>
                </td>
                <td>
                  <StatusBadge
                    status={reservation.status}
                    statusId={reservation.statusId}
                  />
                </td>
                <td>{reservation.remarks}</td>
                <td>
                  {reservation.statusId === ReservationStatus.Pending && (
                    <button className="btn btn-outline btn-error btn-sm">
                      <FaTimes />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

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

export default ReservationList;
