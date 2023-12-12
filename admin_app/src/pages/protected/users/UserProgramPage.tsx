import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { UserProgramOrStrand } from "@definitions/types";
import {
  useUserPrograms,
  useUserTypesWithPrograms,
} from "@hooks/data-fetching/user";
import { useSwitch } from "@hooks/useToggle";
import { Button, Table } from "flowbite-react";
import { useState } from "react";
import EditUserProgramModal from "./EditUserProgramModal";
import NewUserProgramModal from "./NewUserProgramModal";

const UserProgramPage = () => {
  const { data: programs } = useUserPrograms({});
  const [program, setProgram] = useState<UserProgramOrStrand>({
    code: "",
    id: 0,
    name: "",
    userTypeId: 0,
    userType: {
      hasProgram: false,
      id: 0,
      name: "",
      maxAllowedBorrowedBooks: 0,
    },
  });
  const newProgramModal = useSwitch();
  const editProgramModal = useSwitch();
  const { data: userTypes } = useUserTypesWithPrograms({});
  const initEdit = (p: UserProgramOrStrand) => {
    setProgram(p);
    editProgramModal.open();
  };
  return (
    <Container>
      <div className="py-2">
        <Button color="primary" onClick={newProgramModal.open}>
          Program/Strand
        </Button>
      </div>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Code</Table.HeadCell>
            <Table.HeadCell>Program/Strand Name</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {programs?.map((program) => {
              return (
                <Table.Row>
                  <Table.Cell>{program.code}</Table.Cell>
                  <Table.Cell>{program.name}</Table.Cell>
                  <Table.Cell>{program.userType.name}</Table.Cell>
                  <Table.Cell>
                    <Button
                      color="primary"
                      onClick={() => {
                        initEdit(program);
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
      <NewUserProgramModal
        userTypes={userTypes ?? []}
        closeModal={newProgramModal.close}
        isOpen={newProgramModal.isOpen}
      />
      <EditUserProgramModal
        userTypes={userTypes ?? []}
        closeModal={editProgramModal.close}
        isOpen={editProgramModal.isOpen}
        formData={program}
      />
    </Container>
  );
};

export default UserProgramPage;
