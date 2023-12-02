import Container from "@components/ui/container/Container";
import { DangerConfirmDialog } from "@components/ui/dialog/Dialog";
import TableContainer from "@components/ui/table/TableContainer";
import { GameLogInitialValue } from "@definitions/defaults";
import { GameLog } from "@definitions/types";
import { useDeleteGameLog, useGameLogs } from "@hooks/data-fetching/game";
import { useSwitch } from "@hooks/useToggle";
import { useQueryClient } from "@tanstack/react-query";
import Tippy from "@tippyjs/react";
import {
  Button,
  Datepicker,
  Dropdown,
  Label,
  Table,
  TextInput,
} from "flowbite-react";
import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import EditLogModal from "./EditLogModal";
import NewLogModal from "./NewLogModal";
import { MdFilterList } from "react-icons/md";
import { toReadableDate } from "@helpers/datetime";

const GameLoggingPage = () => {
  const [gameLog, setGameLog] = useState<GameLog>({ ...GameLogInitialValue });
  const {
    isOpen: isLogModalOpen,
    close: closeLogModal,
    open: openLogModal,
  } = useSwitch();
  const { data: gameLogs } = useGameLogs({});
  const queryClient = useQueryClient();
  const deleteGameLog = useDeleteGameLog({
    onSuccess: () => {
      toast.success("Game log deleted.");
      queryClient.invalidateQueries(["gameLogs"]);
    },
    onError: () => {
      toast.error("Unknown error occured.");
    },
  });
  const {
    close: closeConfirmDelete,
    open: openConfirmDelete,
    isOpen: isConfirmDeleteOpen,
  } = useSwitch();
  const initDelete = (gameLog: GameLog) => {
    setGameLog(gameLog);
    openConfirmDelete();
  };
  const onConfirmDelete = () => {
    closeConfirmDelete();
    deleteGameLog.mutate(gameLog.id);
  };
  const {
    close: closeEditLog,
    isOpen: isEditLogOpen,
    open: openEditLog,
  } = useSwitch();
  const initEdit = (gameLog: GameLog) => {
    setGameLog(gameLog);
    openEditLog();
  };
  return (
    <Container>
      <div className="py-5">
        <div className="py-3 flex justify-between items-center">
          <div className="flex gap-2">
            <TextInput placeholder="Search by account or game" />
            <Dropdown
              color="light"
              arrowIcon={false}
              className="py-2 p-3"
              label={<MdFilterList className="text-lg" />}
            >
              <div className="p-2 flex flex-col gap-2 ">
                <Label>From</Label>
                <Datepicker />
              </div>
              <div className="p-2 flex flex-col">
                <Label className="block">To</Label>
                <Datepicker />
              </div>
              <Button color="primary" className="w-full">
                Reset
              </Button>
            </Dropdown>
          </div>

          <Button color="primary" onClick={openLogModal}>
            Log Game
          </Button>
        </div>
      </div>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Created At</Table.HeadCell>
            <Table.HeadCell>Game</Table.HeadCell>
            <Table.HeadCell>Client</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {gameLogs?.map((log) => {
              return (
                <Table.Row key={log.id}>
                  <Table.Cell>
                    {new Date(log.createdAt).toLocaleString(undefined, {
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {log.game.name}
                    </div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {log.game.description}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {log.client.givenName} {log.client.surname}
                    </div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {log.client.email}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Tippy content="Edit Log">
                        <Button
                          color="secondary"
                          onClick={() => {
                            initEdit(log);
                          }}
                        >
                          <AiOutlineEdit />
                        </Button>
                      </Tippy>
                      <Tippy content="Delete Log">
                        <Button
                          color="failure"
                          onClick={() => {
                            initDelete(log);
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
      <NewLogModal isOpen={isLogModalOpen} closeModal={closeLogModal} />
      <EditLogModal
        closeModal={closeEditLog}
        isOpen={isEditLogOpen}
        formData={gameLog}
      />
      <DangerConfirmDialog
        title="Delete Game Log"
        onConfirm={onConfirmDelete}
        text="Are you sure you want to delete this log?"
        close={closeConfirmDelete}
        isOpen={isConfirmDeleteOpen}
      />
    </Container>
  );
};

export default GameLoggingPage;
