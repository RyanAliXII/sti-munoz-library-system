import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import TableContainer from "@components/ui/table/TableContainer";
import { Game } from "@definitions/types";
import { useDeleteGame, useGame } from "@hooks/data-fetching/game";
import { useSwitch } from "@hooks/useToggle";
import { useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import { Button, Table } from "flowbite-react";
import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import EditGameModal from "./EditGameModal";
import NewGameModal from "./NewGameModal";
import HasAccess from "@components/auth/HasAccess";

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
  const {
    close: closeDeleteConfirm,
    isOpen: isConfirmDeleteOpen,
    open: openConfirmDelete,
  } = useSwitch();
  const { data: games } = useGame({});
  const queryClient = useQueryClient();
  const deleteGame = useDeleteGame({
    onSuccess: () => {
      toast.success("Game has been deleted.");
      queryClient.invalidateQueries(["games"]);
    },
    onError: () => {
      toast.error("Unknown error occured");
    },
  });
  const [game, setGame] = useState<Game>({
    description: "",
    id: "",
    name: "",
  });
  const initEdit = (game: Game) => {
    setGame(game);
    openEditGameModal();
  };

  const initDelete = (game: Game) => {
    setGame(game);
    openConfirmDelete();
  };
  const onConfirmDelete = () => {
    closeDeleteConfirm();
    deleteGame.mutate(game.id);
  };

  return (
    <Container>
      <div className="py-2">
        <HasAccess requiredPermissions={["Game.Add"]}>
          <Button color="primary" onClick={openNewGameModal}>
            New Game
          </Button>
        </HasAccess>
      </div>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {games?.map((game) => {
              return (
                <Table.Row key={game.id}>
                  <Table.Cell>
                    <div className="font-semibold">{game.name}</div>
                  </Table.Cell>
                  <Table.Cell>{game.description}</Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <HasAccess requiredPermissions={["Game.Edit"]}>
                        <Tippy content="Edit Game">
                          <Button
                            color="secondary"
                            onClick={() => {
                              initEdit(game);
                            }}
                          >
                            <AiOutlineEdit />
                          </Button>
                        </Tippy>
                      </HasAccess>
                      <HasAccess requiredPermissions={["Game.Delete"]}>
                        <Tippy content="Delete Game">
                          <Button
                            color="failure"
                            onClick={() => {
                              initDelete(game);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </Tippy>
                      </HasAccess>
                    </div>
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
      <DangerConfirmDialog
        close={closeDeleteConfirm}
        isOpen={isConfirmDeleteOpen}
        text="Are you sure you want to delete this game? This action is irreversible."
        title="Delete Game"
        onConfirm={onConfirmDelete}
      />
    </Container>
  );
};

export default GamesPage;
