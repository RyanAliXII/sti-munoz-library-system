import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useUserTypes } from "@hooks/data-fetching/user";
import { useSwitch } from "@hooks/useToggle";
import { Button, Table } from "flowbite-react";
import NewUserTypeModal from "./NewUserTypeModal";

const UserTypePage = () => {
  const { data: userTypes } = useUserTypes({});
  const newTypeModal = useSwitch();
  return (
    <Container>
      <TableContainer>
        <div className="py-2">
          <Button color="primary" onClick={newTypeModal.open}>
            New User Type
          </Button>
        </div>
        <Table>
          <Table.Head>
            <Table.HeadCell>Id</Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {userTypes?.map((t) => {
              return (
                <Table.Row key={t.id}>
                  <Table.Cell>{t.id}</Table.Cell>
                  <Table.Cell>{t.name}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
      <NewUserTypeModal
        closeModal={newTypeModal.close}
        isOpen={newTypeModal.isOpen}
      />
    </Container>
  );
};

export default UserTypePage;
