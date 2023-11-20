import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useSwitch } from "@hooks/useToggle";
import { Button, Table } from "flowbite-react";
import NewGameModal from "./NewGameModal";
import { useGame } from "@hooks/data-fetching/game";

const GamesPage = () => {
  const {
    close: closeNewGameModal,
    isOpen: isNewGameModalOpen,
    open: openNewGameModal,
  } = useSwitch();
  const { data: games } = useGame({});
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

          <Table.Body>
            {games?.map((game) => {
              return (
                <Table.Row>
                  <Table.Cell>
                    <div className="font-semibold">{game.name}</div>
                  </Table.Cell>
                  <Table.Cell>{game.description}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
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
