import { PrimaryButton } from "@components/ui/button/Button";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import {
  HeadingRow,
  Table,
  Tbody,
  Th,
  Thead,
} from "@components/ui/table/Table";
import { useSwitch } from "@hooks/useToggle";
import AddOrganizationModal from "./AddOrganizationModal";

const OrganizationAsAuthor = () => {
  const { close, isOpen, open } = useSwitch();
  return (
    <>
      <ContainerNoBackground className="flex gap-2">
        <div className="w-full">
          <PrimaryButton
            onClick={() => {
              open();
            }}
          >
            New Organization
          </PrimaryButton>
        </div>
      </ContainerNoBackground>
      <Container className="lg:px-0">
        <div className="w-full">
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Organization</Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody></Tbody>
          </Table>
        </div>
      </Container>
      <AddOrganizationModal closeModal={close} isOpen={isOpen} />
    </>
  );
};

export default OrganizationAsAuthor;
