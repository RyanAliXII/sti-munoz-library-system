import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { Button, Table } from "flowbite-react";
import NewGameModal from "./NewGameModal";
import { useSwitch } from "@hooks/useToggle";

const GamesPage = () => {
  const {
    close: closeNewGameModal,
    isOpen: isNewGameModalOpen,
    open: openNewGameModal,
  } = useSwitch();
  return (
    <Container>
      <div className="py-2">
        <Button color="primary" onClick={openNewGameModal}>
          New Game
        </Button>
      </div>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
          </Table.Head>
        </Table>
      </TableContainer>
      <NewGameModal
        closeModal={closeNewGameModal}
        isOpen={isNewGameModalOpen}
      />
    </Container>
  );
};

export default GamesPage;
