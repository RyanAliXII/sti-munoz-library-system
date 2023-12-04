import Container from "@components/ui/container/Container";
import { useUserPrograms, useUserTypes } from "@hooks/data-fetching/user";
import { Button, Table } from "flowbite-react";
import NewUserProgramModal from "./NewUserProgramModal";
import { useSwitch } from "@hooks/useToggle";
import TableContainer from "@components/ui/table/TableContainer";

const UserProgramPage = () => {
  const { data: programs } = useUserPrograms({});
  const newProgramModal = useSwitch();
  const { data: userTypes } = useUserTypes({});
  return (
    <Container>
      <div className="py-2">
        <Button color="primary" onClick={newProgramModal.open}>
          Add Program/Strand
        </Button>
      </div>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Code</Table.HeadCell>
            <Table.HeadCell>Program/Strand Name</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {programs?.map((program) => {
              return (
                <Table.Row>
                  <Table.Cell>{program.code}</Table.Cell>
                  <Table.Cell>{program.name}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
      <NewUserProgramModal
        userTypes={userTypes ?? []}
        closeModal={newProgramModal.close}
        isOpen={newProgramModal.isOpen}
      />
    </Container>
  );
};

export default UserProgramPage;
