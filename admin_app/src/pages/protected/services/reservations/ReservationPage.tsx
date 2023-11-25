import Container from "@components/ui/container/Container";
import {
  ConfirmDialog,
  PromptTextAreaDialog,
  WarningConfirmDialog,
} from "@components/ui/dialog/Dialog";
import TableContainer from "@components/ui/table/TableContainer";
import { Reservation } from "@definitions/types";
import {
  useReservations,
  useUpdateStatus,
} from "@hooks/data-fetching/reservation";
import { UseSwitchFunc, useSwitch } from "@hooks/useToggle";
import { ReservationStatus } from "@internal/reservation-status";
import { useQueryClient } from "@tanstack/react-query";
import { Table } from "flowbite-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import ReservationTableRow from "./ReservationTableRow";
import EditRemarksModal from "./EditRemarksModal";
export type UndetailedReservation = Omit<
  Reservation,
  "client" | "dateSlot" | "timeSlot" | "device" | "createdAt"
>;

export type ReservationTableRowProps = {
  reservation: Reservation;
  cancelConfirm: UseSwitchFunc;
  missedConfirm: UseSwitchFunc;
  attendedConfrm: UseSwitchFunc;
  editRemarksModal: UseSwitchFunc;
  setReservation: React.Dispatch<UndetailedReservation>;
};
const ReservationPage = () => {
  const { data: reservations } = useReservations({});
  const cancelConfirm = useSwitch();
  const missedConfirm = useSwitch();
  const attendedConfirm = useSwitch();
  const editRemarksModal = useSwitch();
  const [reservation, setReservation] = useState<UndetailedReservation>({
    accountId: "",
    dateSlotId: "",
    deviceId: "",
    id: "",
    status: "",
    remarks: "",
    statusId: 0,
    timeSlotId: "",
  });
  const queryClient = useQueryClient();
  const updateStatus = useUpdateStatus({
    onSuccess: () => {
      toast.success("Reservation status updated.");
      queryClient.invalidateQueries(["reservations"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });

  const onConfirmAttended = () => {
    attendedConfirm.close();
    updateStatus.mutate({
      id: reservation.id,
      statusId: ReservationStatus.Attended,
    });
  };
  const onConfirmMissed = () => {
    missedConfirm.close();
    updateStatus.mutate({
      id: reservation.id,
      statusId: ReservationStatus.Missed,
    });
  };
  const onConfirmCancel = (remarks: string) => {
    cancelConfirm.close();
    updateStatus.mutate({
      id: reservation.id,
      remarks,
      statusId: ReservationStatus.Cancelled,
    });
  };
  const onEditRemarks = (remarks: string) => {
    editRemarksModal.close();
    updateStatus.mutate({
      id: reservation.id,
      remarks,
      statusId: ReservationStatus.Cancelled,
    });
  };

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
            <Table.HeadCell>Remarks</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {reservations?.map((reservation) => {
              return (
                <ReservationTableRow
                  key={reservation.id}
                  editRemarksModal={editRemarksModal}
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
        onProceed={onConfirmCancel}
      />
      <WarningConfirmDialog
        title="Mark as missed"
        text="Are you sure you want to mark reservation as missed?"
        close={missedConfirm.close}
        isOpen={missedConfirm.isOpen}
        onConfirm={onConfirmMissed}
      />
      <ConfirmDialog
        title="Mark as attended"
        text="Are you sure you want to mark reservation as attended?"
        close={attendedConfirm.close}
        isOpen={attendedConfirm.isOpen}
        onConfirm={onConfirmAttended}
      />
      <EditRemarksModal
        isOpen={editRemarksModal.isOpen}
        closeModal={editRemarksModal.close}
        remarks={reservation.remarks}
        onProceed={onEditRemarks}
      />
    </Container>
  );
};

export default ReservationPage;
