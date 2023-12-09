import HasAccess from "@components/auth/HasAccess";
import Container from "@components/ui/container/Container";
import { useSwitch } from "@hooks/useToggle";
import {
  Button,
  Datepicker,
  Dropdown,
  Label,
  Table,
  TextInput,
} from "flowbite-react";
import { MdFilterList } from "react-icons/md";
import NewDeviceLogModal from "./NewDeviceLogModal";

const DeviceLogPage = () => {
  const logModal = useSwitch();
  return (
    <Container>
      <div className="py-3 flex justify-between items-center">
        <div className="flex gap-2">
          <TextInput placeholder="Search by account or device" />
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
        <HasAccess>
          <Button color="primary" onClick={logModal.open}>
            Log Device
          </Button>
        </HasAccess>
      </div>

      <Table>
        <Table.Head>
          <Table.HeadCell>Created At</Table.HeadCell>
          <Table.HeadCell>Device</Table.HeadCell>
          <Table.HeadCell>Patron</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
      </Table>
      <NewDeviceLogModal closeModal={logModal.close} isOpen={logModal.isOpen} />
    </Container>
  );
};

export default DeviceLogPage;
