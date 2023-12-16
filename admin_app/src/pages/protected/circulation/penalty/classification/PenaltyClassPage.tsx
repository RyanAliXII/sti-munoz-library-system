import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useSwitch } from "@hooks/useToggle";
import { Button, Table } from "flowbite-react";
import NewPenaltyClassModal from "./NewPenaltyClassModal";

const PenaltyClassPage = () => {
  const newClassModal = useSwitch();

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
          </Table.Head>
          <Table.Body></Table.Body>
        </Table>
      </TableContainer>
      <NewPenaltyClassModal
        closeModal={newClassModal.close}
        isOpen={newClassModal.isOpen}
      />
    </Container>
  );
};

export default PenaltyClassPage;
