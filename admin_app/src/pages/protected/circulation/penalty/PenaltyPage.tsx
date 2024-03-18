import Container from "@components/ui/container/Container";

import HasAccess from "@components/auth/HasAccess";
import TableContainer from "@components/ui/table/TableContainer";
import { AccountInitialValue } from "@definitions/defaults";
import { Penalty, PenaltyClassification } from "@definitions/types";
import { toReadableDate, toReadableDatetime } from "@helpers/datetime";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useQuery } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
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
import { ChangeEvent, useState } from "react";
import {
  AiFillCheckCircle,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlinePlus,
} from "react-icons/ai";
import AddPenaltyModal from "./AddPenaltyModal";
import EditPenaltyModal from "./EditPenaltyModal";
import EditSettlementModal from "./EditSettlementModal";
import SettleModal from "./SettleModal";
import ViewPenaltyModal from "./ViewPenaltyModal";
import { usePenaltyBill } from "@hooks/data-fetching/penalty";
import { useSearchParamsState } from "react-use-search-params-state";
import CustomSelect from "@components/ui/form/CustomSelect";
import { MdFilterList } from "react-icons/md";
import { format } from "date-fns";
import useDebounce from "@hooks/useDebounce";
export type PenaltyForm = {
  id?: string;
  item: string;
  accountId: string;
  description: string;
  amount: number;
  classId: string;
  classification: PenaltyClassification;
};
const PenaltyPage = () => {
  const { Get } = useRequest();

  const [filters, setFilters] = useSearchParamsState({
    page: { default: 1, type: "number" },
    keyword: { default: "", type: "string" },
    from: { default: "", type: "string" },
    to: { default: "", type: "string" },
  });
  const {
    isOpen: isAddModalOpen,
    open: openAddModal,
    close: closeAddModal,
  } = useSwitch();
  const {
    isOpen: isEditModalOpen,
    open: openEditModal,
    close: closeEditModal,
  } = useSwitch();
  const {
    isOpen: isViewModalOpen,
    open: openViewModal,
    close: closeViewModal,
  } = useSwitch();
  const settleModal = useSwitch();
  const editSettlement = useSwitch();
  const fetchPenalties = async () => {
    try {
      const response = await Get("/penalties/", {
        params: filters,
      });
      const { data } = response.data;
      return data?.penalties ?? [];
    } catch (error) {
      return [];
    }
  };
  const { data: penalties } = useQuery<Penalty[]>({
    queryKey: ["penalties", filters],
    queryFn: fetchPenalties,
  });
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty>({
    id: "",
    account: AccountInitialValue,
    classId: "",
    classification: {
      amount: 0,
      description: "",
      id: "",
      name: "",
    },
    accountId: "",
    createdAt: "",
    isSettled: false,
    settledAt: "",
    description: "",
    amount: 0,
    item: "",
  });
  const { data: billUrl, refetch: refetchBill } = usePenaltyBill({
    queryKey: ["penaltyBill", selectedPenalty.id ?? ""],
  });
  const initEditSettleMent = (penalty: Penalty) => {
    editSettlement.open();
    setSelectedPenalty(penalty);
  };

  const handleFrom = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setFilters({
      from: dateStr,
      page: 1,
    });
  };
  const handleTo = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setFilters({
      to: dateStr,
      page: 1,
    });
  };
  const handleReset = () => {
    setFilters({
      from: "",
      to: "",
      keyword: "",
    });
  };
  const debounceSearch = useDebounce();
  const search = (q: any) => {
    setFilters({ page: 1, keyword: q });
  };
  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    debounceSearch(search, event.target.value, 500);
  };
  return (
    <>
      <Container>
        <div className="flex w-full justify-between py-4">
          <div className="flex gap-2">
            <TextInput
              placeholder="Search by account"
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
                  value={toReadableDate(filters?.from)}
                  onSelectedDateChanged={handleFrom}
                />
              </div>
              <div className="p-2 flex flex-col">
                <Label className="block">To</Label>
                <Datepicker
                  value={toReadableDate(filters?.to)}
                  onSelectedDateChanged={handleTo}
                />
              </div>
              <div className="p-2">
                <Label>Status</Label>
                <CustomSelect />
              </div>
              <div className="p-2">
                <Label>Min Penalty</Label>
                <TextInput></TextInput>
              </div>
              <div className="p-2">
                <Label>Max Penalty</Label>
                <TextInput></TextInput>
              </div>
              <div className="p-2">
                <Label>Sort by</Label>
                <Select name="sortBy">
                  <option value="dateCreated">Date Created</option>
                  <option value="givenName">Given name</option>
                  <option value="surname">Surname</option>
                </Select>
              </div>

              <div className="pb-3 px-2">
                <Label>Order</Label>
                <div className="flex flex-col">
                  <div className="flex gap-1 items-center mt-1">
                    <Radio name="order" value="asc" color="primary" />
                    <Label>Ascending</Label>
                  </div>
                  <div className="flex gap-1 items-center mt-1">
                    <Radio name="order" value="desc" color="primary" />
                    <Label>Descending</Label>
                  </div>
                </div>
              </div>

              <Button color="primary" className="w-full" onClick={handleReset}>
                Reset
              </Button>
            </Dropdown>
          </div>
          <HasAccess requiredPermissions={["Penalty.Add"]}>
            <Button
              color="primary"
              className="flex items-center gap-1"
              onClick={openAddModal}
            >
              <AiOutlinePlus className="text-lg " /> Add Penalty
            </Button>
          </HasAccess>
        </div>
        <TableContainer>
          <Table>
            <Table.Head>
              <Table.HeadCell>Account</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Created At</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y dark:divide-gray-700">
              {penalties?.map((penalty) => (
                <Table.Row key={penalty.id}>
                  <Table.Cell>
                    <div></div>

                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {penalty.account.givenName} {penalty.account.surname}
                    </div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {penalty.account.email}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{penalty.amount}</Table.Cell>
                  <Table.Cell>
                    {penalty.isSettled ? (
                      <span className="text-green-500">Settled</span>
                    ) : (
                      <span
                        className="text-red-500
                    "
                      >
                        Unsettled
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {toReadableDatetime(penalty.createdAt)}
                  </Table.Cell>
                  <Table.Cell className="flex gap-2">
                    <Tippy content="View Penalty">
                      <Button
                        color="primary"
                        onClick={() => {
                          refetchBill();
                          setSelectedPenalty(penalty);
                          openViewModal();
                        }}
                      >
                        <AiOutlineEye className="text-lg" />
                      </Button>
                    </Tippy>
                    <HasAccess requiredPermissions={["Penalty.Edit"]}>
                      {!penalty.isSettled && (
                        <Tippy content="Edit Penalty">
                          <Button
                            color="secondary"
                            onClick={() => {
                              setSelectedPenalty(penalty);
                              openEditModal();
                            }}
                          >
                            <AiOutlineEdit className="text-lg" />
                          </Button>
                        </Tippy>
                      )}

                      {penalty.isSettled && (
                        <Tippy content="Edit Settlement">
                          <Button
                            color="secondary"
                            onClick={() => {
                              initEditSettleMent(penalty);
                            }}
                          >
                            <AiOutlineEdit className="text-lg" />
                          </Button>
                        </Tippy>
                      )}

                      {!penalty.isSettled && (
                        <Tippy content="Mark as Settled">
                          <Button
                            color="success"
                            onClick={() => {
                              settleModal.open();
                            }}
                          >
                            <AiFillCheckCircle className="text-lg" />
                          </Button>
                        </Tippy>
                      )}
                    </HasAccess>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </TableContainer>
      </Container>
      <AddPenaltyModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      <EditPenaltyModal
        isOpen={isEditModalOpen}
        closeModal={closeEditModal}
        penalty={selectedPenalty}
      />
      <EditSettlementModal
        closeModal={editSettlement.close}
        isOpen={editSettlement.isOpen}
        formData={selectedPenalty}
      />
      <SettleModal
        isOpen={settleModal.isOpen}
        closeModal={settleModal.close}
        formData={selectedPenalty}
      />
      <ViewPenaltyModal
        closeModal={closeViewModal}
        isOpen={isViewModalOpen}
        url={billUrl ?? ""}
      />
    </>
  );
};

export default PenaltyPage;
