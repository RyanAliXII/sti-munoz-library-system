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
import CustomPagination from "@components/pagination/CustomPagination";
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
  const { data: reservationData } = useReservations({});
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
      statusId: 0,
    });
  };

  return (
    <Container>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Created At</Table.HeadCell>
            <Table.HeadCell>Patron</Table.HeadCell>
            <Table.HeadCell>Device</Table.HeadCell>
            <Table.HeadCell>Reservation Date</Table.HeadCell>
            <Table.HeadCell>Status</Table.HeadCell>
            <Table.HeadCell>Remarks</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {reservationData?.reservations?.map((reservation) => {
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
      <div className="py-5">
        <CustomPagination
          isHidden={(reservationData?.metadata?.pages ?? 0) <= 1}
          pageCount={reservationData?.metadata?.pages ?? 0}
        />
      </div>
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
      <PromptTextAreaDialog
        close={cancelConfirm.close}
        isOpen={cancelConfirm.isOpen}
        label="Remarks"
        placeholder=""
        proceedBtnText="Save"
        title="Reservation Remarks"
        submitButtonsProps={{
          color: "primary ",
        }}
        onProceed={onConfirmCancel}
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
