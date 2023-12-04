import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useUserTypes } from "@hooks/data-fetching/user";
import { useSwitch } from "@hooks/useToggle";
import { Button, Table } from "flowbite-react";
import NewUserTypeModal from "./NewUserTypeModal";
import EditUserTypeModal from "./EditUserTypeModal";
import { useState } from "react";
import { UserType } from "@definitions/types";

const UserTypePage = () => {
  const { data: userTypes } = useUserTypes({});
  const [userType, setUserType] = useState<UserType>({
    hasProgram: false,
    id: 0,
    name: "",
  });
  const newTypeModal = useSwitch();
  const editTypeModal = useSwitch();
  const initEdit = (userType: UserType) => {
    setUserType(userType);
    editTypeModal.open();
  };
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
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {userTypes?.map((t) => {
              return (
                <Table.Row key={t.id}>
                  <Table.Cell>{t.id}</Table.Cell>
                  <Table.Cell>{t.name}</Table.Cell>
                  <Table.Cell>
                    <Button
                      color="primary"
                      onClick={() => {
                        initEdit(t);
                      }}
                    >
                      Edit
                    </Button>
                  </Table.Cell>
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
      <EditUserTypeModal
        formData={userType}
        closeModal={editTypeModal.close}
        isOpen={editTypeModal.isOpen}
      />
    </Container>
  );
};

export default UserTypePage;
