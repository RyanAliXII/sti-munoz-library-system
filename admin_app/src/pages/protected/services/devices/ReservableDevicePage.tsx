import Container from "@components/ui/container/Container";
import { Button, Table } from "flowbite-react";
import NewDeviceModal from "./NewDeviceModal";
import { useSwitch } from "@hooks/useToggle";

const ReservableDevicePage = () => {
  const {
    isOpen: isNewDeviceModelOpen,
    close: closeNewDeviceModal,
    open: openNewDeviceModal,
  } = useSwitch();
  return (
    <Container>
      <div className="py-5">
        <Button color="primary" onClick={openNewDeviceModal}>
          {" "}
          New Device
        </Button>
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Description</Table.HeadCell>
          <Table.HeadCell>Available Device</Table.HeadCell>
        </Table.Head>
        <Table.Body></Table.Body>
      </Table>
      <NewDeviceModal
        closeModal={closeNewDeviceModal}
        isOpen={isNewDeviceModelOpen}
      />
    </Container>
  );
};

export default ReservableDevicePage;
