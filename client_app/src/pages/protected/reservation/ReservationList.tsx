import RemarksModal from "@components/ui/dialog/RemarksModal";
import { to12HR, toReadableDate } from "@helpers/datetime";
import { useReservations } from "@hooks/data-fetching/reservation";
import { useSwitch } from "@hooks/useToggle";
import { ReservationStatus } from "@internal/reservation-status";
import { FaTimes } from "react-icons/fa";
import StatusBadge from "./StatusBadge";

const ReservationList = () => {
  const { data: reservations } = useReservations({});
  const remarksModal = useSwitch();

  const initCancellation = () => {
    remarksModal.open();
  };
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
                    <button
                      className="btn btn-outline btn-error btn-sm"
                      onClick={initCancellation}
                    >
                      <FaTimes />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <RemarksModal
        closeModal={remarksModal.close}
        isOpen={remarksModal.isOpen}
        title="Cancellation Reason"
      />
    </div>
  );
};
export default ReservationList;
