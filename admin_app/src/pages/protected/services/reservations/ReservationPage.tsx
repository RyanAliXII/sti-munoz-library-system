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
import {
  Button,
  Datepicker,
  Dropdown,
  Label,
  Radio,
  Select,
  Table,
  TextInput,
} from "flowbite-react";
import React, { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import ReservationTableRow from "./ReservationTableRow";
import EditRemarksModal from "./EditRemarksModal";
import CustomPagination from "@components/pagination/CustomPagination";
import { useSearchParamsState } from "react-use-search-params-state";
import { C } from "@fullcalendar/core/internal-common";
import { format } from "date-fns";
import useDebounce from "@hooks/useDebounce";
import { MdFilterList } from "react-icons/md";
import { toReadableDate } from "@helpers/datetime";
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
  const [filterParams, setFilterParams] = useSearchParamsState({
    page: { default: 1, type: "number" },
    from: { default: "", type: "string" },
    to: { default: "", type: "string" },
    keyword: { default: "", type: "string" },
    status: { default: [], type: "number", multiple: true },
    devices: { default: [], type: "string", multiple: true },
    sortBy: { default: "dateCreated", type: "string" },
    order: { default: "desc", type: "string" },
  });

  const handleFrom = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setFilterParams({
      from: dateStr,
      page: 1,
    });
  };
  const handleTo = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setFilterParams({
      to: dateStr,
      page: 1,
    });
  };
  const handleReset = () => {
    setFilterParams({
      from: "",
      to: "",
      keyword: "",
      userTypes: [],
      page: 1,
      userPrograms: [],
      sortBy: "dateCreated",
      order: "desc",
    });
  };
  const handleSortBySelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFilterParams({
      sortBy: value,
    });
  };

  const debounceSearch = useDebounce();
  const search = (q: any) => {
    setFilterParams({ page: 1, keyword: q });
  };
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    debounceSearch(search, event.target.value, 500);
  };
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
  const handleOrderSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterParams({
      order: value,
    });
  };
  return (
    <Container>
      <div className="py-3 flex gap-2">
        <TextInput
          placeholder="Search by account or device"
          onChange={handleSearch}
        />
        <Dropdown
          color="light"
          arrowIcon={false}
          className="py-2 p-3"
          label={<MdFilterList className="text-lg" />}
        >
          <div className="p-2 flex flex-col gap-2 ">
            <Label>From</Label>
            <Datepicker
              value={toReadableDate(filterParams?.from)}
              onSelectedDateChanged={handleFrom}
            />
          </div>
          <div className="p-2 flex flex-col">
            <Label className="block">To</Label>
            <Datepicker
              value={toReadableDate(filterParams?.to)}
              onSelectedDateChanged={handleTo}
            />
          </div>
          {/* <div className="p-2">
            <Label>Device</Label>
            <CustomSelect
              options={userTypes ?? []}
              isMulti={true}
              onChange={handleUserTypeSelect}
              value={userTypes?.filter((c) =>
                filterParams?.userTypes.includes(c.id?.toString())
              )}
              getOptionLabel={(opt) => opt.name}
              getOptionValue={(opt) => opt.id?.toString() ?? ""}
              placeholder="Select User Type"
            />
          </div> */}
          <div className="p-2"></div>
          <div className="p-2">
            <Label>Sort by</Label>
            <Select
              name="sortBy"
              value={filterParams.sortBy}
              onChange={handleSortBySelect}
            >
              <option value="dateCreated">Date Created</option>
              <option value="givenName">Given name</option>
              <option value="surname">Surname</option>
            </Select>
          </div>

          <div className="pb-3 px-2">
            <Label>Order</Label>
            <div className="flex flex-col">
              <div className="flex gap-1 items-center mt-1">
                <Radio
                  name="order"
                  value="asc"
                  onChange={handleOrderSelect}
                  color="primary"
                  checked={filterParams.order === "asc"}
                />
                <Label>Ascending</Label>
              </div>
              <div className="flex gap-1 items-center mt-1">
                <Radio
                  name="order"
                  value="desc"
                  color="primary"
                  onChange={handleOrderSelect}
                  checked={filterParams.order === "desc"}
                />
                <Label>Descending</Label>
              </div>
            </div>
          </div>

          <Button color="primary" className="w-full" onClick={handleReset}>
            Reset
          </Button>
        </Dropdown>
        {/* <Button color="primary" onClick={exportModal.open}>
          Export
        </Button> */}
      </div>
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
