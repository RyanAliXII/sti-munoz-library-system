import Container from "@components/ui/container/Container";
import { useUserTypes } from "@hooks/data-fetching/user";
import { useSwitch } from "@hooks/useToggle";
import { Table } from "flowbite-react";
import AddUserTypeModal from "./AddUserTypeModal";

const UserTypePage = () => {
  const { data: userTypes } = useUserTypes({});

  const newTypeModal = useSwitch();
  return (
    <Container>
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
      <AddUserTypeModal
        closeModal={newTypeModal.close}
        isOpen={newTypeModal.isOpen}
      />
    </Container>
  );
};

export default UserTypePage;
