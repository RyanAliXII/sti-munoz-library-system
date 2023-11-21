import Container from "@components/ui/container/Container";
import { Button, Table } from "flowbite-react";
import NewDeviceModal from "./NewDeviceModal";
import { useSwitch } from "@hooks/useToggle";
import { useDevices } from "@hooks/data-fetching/device";
import TableContainer from "@components/ui/table/TableContainer";
import EditDeviceModal from "./EditDeviceModal";
import { useState } from "react";
import { Device } from "@definitions/types";
import Tippy from "@tippyjs/react";
import { AiOutlineEdit } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";

const ReservableDevicePage = () => {
  const {
    isOpen: isNewDeviceModalOpen,
    close: closeNewDeviceModal,
    open: openNewDeviceModal,
  } = useSwitch();
  const {
    isOpen: isEditDeviceModalOpen,
    close: closeEditDeviceModal,
    open: openEditDeviceModal,
  } = useSwitch();
  const { data: devices } = useDevices({});
  const [device, setDevice] = useState<Device>({
    available: 0,
    description: "",
    id: "",
    name: "",
  });
  const initEdit = (device: Device) => {
    setDevice(device);
    openEditDeviceModal();
  };
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
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Tippy content="Edit Game">
                        <Button
                          color="secondary"
                          onClick={() => {
                            initEdit(device);
                          }}
                        >
                          <AiOutlineEdit />
                        </Button>
                      </Tippy>
                      <Tippy content="Delete Game">
                        <Button
                          color="failure"
                          onClick={() => {
                            //initDelete(game);
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
      <NewDeviceModal
        closeModal={closeNewDeviceModal}
        isOpen={isNewDeviceModalOpen}
      />
      <EditDeviceModal
        isOpen={isEditDeviceModalOpen}
        closeModal={closeEditDeviceModal}
        formData={device}
      />
    </Container>
  );
};

export default ReservableDevicePage;
