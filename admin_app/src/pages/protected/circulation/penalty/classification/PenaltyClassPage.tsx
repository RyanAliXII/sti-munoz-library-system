import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useSwitch } from "@hooks/useToggle";
import { Button, Table } from "flowbite-react";
import NewPenaltyClassModal from "./NewPenaltyClassModal";
import {
  useDeletePenaltyClass,
  usePenaltyClasses,
} from "@hooks/data-fetching/penalty";
import { AiOutlineEdit } from "react-icons/ai";
import Tippy from "@tippyjs/react";
import EditPenaltyClassModal from "./EditPenaltyClassModal";
import { useState } from "react";
import { PenaltyClassification } from "@definitions/types";
import { FaTrash } from "react-icons/fa";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

const PenaltyClassPage = () => {
  const newClassModal = useSwitch();
  const editClassModal = useSwitch();

  const [penaltyClass, setPenaltyClass] = useState<PenaltyClassification>({
    amount: 0,
    description: "",
    id: "",
    name: "",
  });
  const { data: classes } = usePenaltyClasses({});
  const queryClient = useQueryClient();
  const deleteClass = useDeletePenaltyClass({
    onSuccess: () => {
      toast.success("Penalty class deleted.");
      queryClient.invalidateQueries(["penaltyClasses"]);
    },
  });
  const deleteConfirm = useSwitch();

  const onConfirm = () => {
    deleteConfirm.close();
    deleteClass.mutate(penaltyClass.id);
  };
  return (
    <Container>
      <div className="py-2">
        <Button color="primary" onClick={newClassModal.open}>
          New Classification
        </Button>
      </div>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell>Amount</Table.HeadCell>
          </Table.Head>
          <Table.Body>
            {classes?.map((pClass) => {
              return (
                <Table.Row key={pClass.id}>
                  <Table.Cell>{pClass.name}</Table.Cell>
                  <Table.Cell>{pClass.description}</Table.Cell>
                  <Table.Cell>{pClass.amount}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2 items-center">
                      <Tippy content="Edit Penalty Class">
                        <Button
                          color="primary"
                          onClick={() => {
                            setPenaltyClass(pClass);
                            editClassModal.open();
                          }}
                        >
                          <AiOutlineEdit />
                        </Button>
                      </Tippy>
                      <Tippy content="Delete Penalty Class">
                        <Button
                          color="failure"
                          onClick={() => {
                            setPenaltyClass(pClass);
                            deleteConfirm.open();
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </Tippy>
                    </div>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
      <NewPenaltyClassModal
        closeModal={newClassModal.close}
        isOpen={newClassModal.isOpen}
      />
      <EditPenaltyClassModal
        formData={penaltyClass}
        closeModal={editClassModal.close}
        isOpen={editClassModal.isOpen}
      />
      <DangerConfirmDialog
        title="Delete Penalty Classification"
        text="Are you sure you want to delete penalty classification?"
        onConfirm={onConfirm}
        isOpen={deleteConfirm.isOpen}
        close={deleteConfirm.close}
      />
    </Container>
  );
};

export default PenaltyClassPage;
