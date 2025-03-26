import RemarksModal from "@components/ui/dialog/RemarksModal";
import { to12HR, toReadableDate } from "@helpers/datetime";
import {
  UpdateStatusForm,
  useReservations,
  useUpdateStatus,
} from "@hooks/data-fetching/reservation";
import { useSwitch } from "@hooks/useToggle";
import { ReservationStatus } from "@internal/reservation-status";
import { FaTimes } from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useState } from "react";
import { Reservation } from "@definitions/types";
import { Table } from "flowbite-react";

const ReservationList = () => {
  const { data: reservations } = useReservations({});
  const remarksModal = useSwitch();
  const [reservation, setReservation] = useState<UpdateStatusForm>({
    id: "",
    statusId: ReservationStatus.Pending,
    remarks: "",
  });
  const initCancellation = (r: Reservation) => {
    setReservation({
      id: r.id,
      statusId: ReservationStatus.Cancelled,
      remarks: "",
    });
    remarksModal.open();
  };
  const queryClient = useQueryClient();
  const updateStatus = useUpdateStatus({
    onSuccess: () => {
      queryClient.invalidateQueries(["reservations"]);
      toast.success("Reservation status updated.");
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const onConfirm = (text: string) => {
    remarksModal.close();
    updateStatus.mutate({ ...reservation, remarks: text });
  };
  return (
    <div className="overflow-x-auto">
      <Table>
        <Table.Head>
            <Table.HeadCell>Device</Table.HeadCell>
            <Table.HeadCell>Reservation Date</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Remarks</Table.HeadCell>
            <th></th>
        </Table.Head>
        <Table.Body className="divide-y dark:divide-gray-700">
          {reservations?.map((reservation) => {
            return (
              <Table.Row key={reservation.id}>
                <Table.Cell>
                  <div className="font-semibold">{reservation.device.name}</div>
                  <div className="text-sm">
                    {" "}
                    {reservation.device.description}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className="font-semibold">
                    {toReadableDate(reservation.dateSlot.date)}
                  </div>
                  <div className="text-sm">
                    {`${to12HR(reservation.timeSlot.startTime)} to ${to12HR(
                      reservation.timeSlot.endTime
                    )}`}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <StatusBadge
                    status={reservation.status}
                    statusId={reservation.statusId}
                  />
                </Table.Cell>
                <Table.Cell>
                  {reservation.remarks.length > 0 ? reservation.remarks : "N/A"}
                </Table.Cell>
                <Table.Cell>
                  {reservation.statusId === ReservationStatus.Pending && (
                    <button
                      className="btn btn-outline btn-error btn-sm"
                      onClick={() => {
                        initCancellation(reservation);
                      }}
                    >
                      <FaTimes />
                    </button>
                  )}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <RemarksModal
        closeModal={remarksModal.close}
        isOpen={remarksModal.isOpen}
        title="Cancellation Reason"
        onProceed={onConfirm}
      />
    </div>
  );
};
export default ReservationList;
