import Container from "@components/ui/container/Container";
import { Button, Table } from "flowbite-react";
import NewDeviceModal from "./NewDeviceModal";
import { useSwitch } from "@hooks/useToggle";
import { useDevices } from "@hooks/data-fetching/device";
import TableContainer from "@components/ui/table/TableContainer";

const ReservableDevicePage = () => {
  const {
    isOpen: isNewDeviceModelOpen,
    close: closeNewDeviceModal,
    open: openNewDeviceModal,
  } = useSwitch();
  const { data: devices } = useDevices({});
  return (
    <Container>
      <div className="py-3">
        <Button color="primary" onClick={openNewDeviceModal}>
          {" "}
          New Device
        </Button>
      </div>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Description</Table.HeadCell>
            <Table.HeadCell>Available Device</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {devices?.map((device) => {
              return (
                <Table.Row key={device.id}>
                  <Table.Cell>
                    <div className="font-semibold">{device.name}</div>
                  </Table.Cell>
                  <Table.Cell>{device.description}</Table.Cell>
                  <Table.Cell>{device.available}</Table.Cell>
                  <Table.Cell></Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </TableContainer>
      <NewDeviceModal
        closeModal={closeNewDeviceModal}
        isOpen={isNewDeviceModelOpen}
      />
    </Container>
  );
};

export default ReservableDevicePage;
