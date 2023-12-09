import Container from "@components/ui/container/Container";

import TableContainer from "@components/ui/table/TableContainer";
import { AccountInitialValue } from "@definitions/defaults";
import { Penalty } from "@definitions/types";
import { toReadableDatetime } from "@helpers/datetime";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { useState } from "react";
import {
  AiFillCheckCircle,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlinePlus,
} from "react-icons/ai";
import { MdRemoveCircle } from "react-icons/md";
import { toast } from "react-toastify";
import AddPenaltyModal from "./AddPenaltyModal";
import EditPenaltyModal from "./EditPenaltyModal";
import ViewPenaltyModal from "./ViewPenaltyModal";
import SettleModal from "./SettleModal";
import EditSettlementModal from "./EditSettlementModal";

const PenaltyPage = () => {
  const { Get } = useRequest();
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
      const response = await Get("/penalties/", {});
      const { data } = response.data;
      return data?.penalties ?? [];
    } catch (error) {
      return [];
    }
  };
  const { data: penalties } = useQuery<Penalty[]>({
    queryKey: ["penalties"],
    queryFn: fetchPenalties,
  });
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty>({
    id: "",
    account: AccountInitialValue,
    accountId: "",
    createdAt: "",
    isSettled: false,
    settledAt: "",
    description: "",
    amount: 0,
    item: "",
  });
  const initEditSettleMent = (penalty: Penalty) => {
    editSettlement.open();
    setSelectedPenalty(penalty);
  };
  return (
    <>
      <Container>
        <div className="flex w-full justify-end py-4">
          <Button
            color="primary"
            className="flex items-center gap-1"
            onClick={openAddModal}
          >
            <AiOutlinePlus className="text-lg " /> Add Penalty
          </Button>
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
                          setSelectedPenalty(penalty);
                          openViewModal();
                        }}
                      >
                        <AiOutlineEye className="text-lg" />
                      </Button>
                    </Tippy>

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
        penalty={selectedPenalty}
      />
    </>
  );
};

export default PenaltyPage;
