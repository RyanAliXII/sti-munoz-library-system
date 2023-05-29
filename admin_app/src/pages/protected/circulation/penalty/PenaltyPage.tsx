import { ButtonClasses, PrimaryButton } from "@components/ui/button/Button";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { apiScope } from "@definitions/configs/msal/scopes";
import { Penalty } from "@definitions/types";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { update } from "lodash";
import {
  AiFillCheckCircle,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlinePlus,
} from "react-icons/ai";
import { CiCircleRemove } from "react-icons/ci";
import { toast } from "react-toastify";
import TimeAgo from "timeago-react";
import AddPenaltyModal from "./AddPenaltyModal";
import { useSwitch } from "@hooks/useToggle";
import { MdCircle, MdRemoveCircle } from "react-icons/md";
import { useState } from "react";
import EditPenaltyModal from "./EditPenaltyModal";
import { AccountInitialValue } from "@definitions/defaults";
import ViewPenaltyModal from "./ViewPenaltyModal";

const PenaltyPage = () => {
  const { Get, Patch } = useRequest();

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
  const fetchPenalties = async () => {
    try {
      const response = await Get("/penalties/", {}, [apiScope("Penalty.Read")]);
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
  });
  const queryClient = useQueryClient();
  const updateSettlement = useMutation({
    mutationFn: (body: { id: string; isSettled: boolean }) =>
      Patch(
        `/penalties/${body.id}/settlement`,
        {},
        {
          params: {
            settle: body.isSettled,
          },
        },
        [apiScope("Penalty.Edit")]
      ),

    onSuccess: () => {
      toast.success("Penalty has been updated");
      queryClient.invalidateQueries(["penalties"]);
    },
    onError: () => {
      toast.error("Unknown error occured, Please try again later");
    },
  });

  return (
    <>
      <ContainerNoBackground className="flex gap-2 justify-between px-0 mb-0 lg:mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-700">Penalties</h1>
          <PrimaryButton
            className="flex items-center gap-1"
            onClick={openAddModal}
          >
            <AiOutlinePlus className="text-lg " /> Add Penalty
          </PrimaryButton>
        </div>
      </ContainerNoBackground>

      <Container>
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Created At</Th>
              <Th>Account</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th></Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {penalties?.map((penalty) => (
              <BodyRow key={penalty.id}>
                <Td>
                  <TimeAgo datetime={penalty.createdAt} />
                </Td>
                <Td>
                  {penalty.account.givenName} {penalty.account.surname}
                </Td>
                <Td>{penalty.amount}</Td>
                <Td>
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
                </Td>
                <Td className="flex gap-2">
                  <Tippy content="View Penalty">
                    <button
                      className={ButtonClasses.PrimaryOutlineButtonClasslist}
                      onClick={() => {
                        setSelectedPenalty(penalty);
                        openViewModal();
                      }}
                    >
                      <AiOutlineEye className="text-lg" />
                    </button>
                  </Tippy>
                  <Tippy content="Edit Penalty">
                    <button
                      className={ButtonClasses.SecondaryOutlineButtonClasslist}
                      onClick={() => {
                        setSelectedPenalty(penalty);
                        openEditModal();
                      }}
                    >
                      <AiOutlineEdit className="text-lg" />
                    </button>
                  </Tippy>
                  {penalty.isSettled && (
                    <Tippy content="Mark as Unsettled">
                      <button
                        className="p-2 border border-red-500 text-red-500 rounded"
                        onClick={() => {
                          updateSettlement.mutate({
                            id: penalty.id ?? "",
                            isSettled: false,
                          });
                        }}
                      >
                        <MdRemoveCircle className="text-lg" />
                      </button>
                    </Tippy>
                  )}
                  {!penalty.isSettled && (
                    <Tippy content="Mark as Settled">
                      <button
                        className="p-2 border border-green-500 text-green-500 rounded
                      "
                        onClick={() => {
                          updateSettlement.mutate({
                            id: penalty.id ?? "",
                            isSettled: true,
                          });
                        }}
                      >
                        <AiFillCheckCircle className="text-lg" />
                      </button>
                    </Tippy>
                  )}
                </Td>
              </BodyRow>
            ))}
          </Tbody>
        </Table>
      </Container>
      <AddPenaltyModal isOpen={isAddModalOpen} closeModal={closeAddModal} />
      <EditPenaltyModal
        isOpen={isEditModalOpen}
        closeModal={closeEditModal}
        penalty={selectedPenalty}
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
