import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useTimeSlotProfile } from "@hooks/data-fetching/time-slot-profile";
import { Button, Table } from "flowbite-react";

const TimeSlotPage = () => {
  const {} = useTimeSlotProfile({});
  return (
    <Container>
      <div className="py-3">
        <Button color="primary">New Slot</Button>
      </div>

      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>From</Table.HeadCell>
            <Table.HeadCell>To</Table.HeadCell>
          </Table.Head>
          <Table.Body></Table.Body>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TimeSlotPage;
