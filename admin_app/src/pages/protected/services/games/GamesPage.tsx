import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useSwitch } from "@hooks/useToggle";
import { Button, Table } from "flowbite-react";
import NewGameModal from "./NewGameModal";
import { useGame } from "@hooks/data-fetching/game";
import Tippy from "@tippyjs/react";
import { AiOutlineEdit } from "react-icons/ai";
import { useState } from "react";
import { Game } from "@definitions/types";
import EditGameModal from "./EditGameModal";

const GamesPage = () => {
  const {
    close: closeNewGameModal,
    isOpen: isNewGameModalOpen,
    open: openNewGameModal,
  } = useSwitch();
  const {
    close: closeEditGameModal,
    isOpen: isEditGameModalOpen,
    open: openEditGameModal,
  } = useSwitch();
  const { data: games } = useGame({});
  const [game, setGame] = useState<Game>({
    description: "",
    id: "",
    name: "",
  });

  const initEdit = (game: Game) => {
    setGame(game);
    openEditGameModal();
  };
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
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>

          <Table.Body>
            {games?.map((game) => {
              return (
                <Table.Row>
                  <Table.Cell>
                    <div className="font-semibold">{game.name}</div>
                  </Table.Cell>
                  <Table.Cell>{game.description}</Table.Cell>
                  <Table.Cell>
                    <Button color="secondary">
                      <Tippy content="Edit Game">
                        <AiOutlineEdit
                          onClick={() => {
                            initEdit(game);
                          }}
                        />
                      </Tippy>
                    </Button>
                  </Table.Cell>
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

      <EditGameModal
        closeModal={closeEditGameModal}
        formData={game}
        isOpen={isEditGameModalOpen}
      />
    </Container>
  );
};

export default GamesPage;
