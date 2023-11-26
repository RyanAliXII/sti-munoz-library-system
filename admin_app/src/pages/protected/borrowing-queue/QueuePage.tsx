import Container from "@components/ui/container/Container";
import { Tabs } from "flowbite-react";
import ActiveQueuesTable from "./ActiveQueuesTable";
import QueueHistory from "./QueueHistory";
const QueuePage = () => {
  return (
    <Container>
      <Tabs.Group color="primary" style="underline">
        <Tabs.Item title="Ongoing Queue">
          <ActiveQueuesTable />
        </Tabs.Item>
        <Tabs.Item title="Queue History">
          <QueueHistory />
        </Tabs.Item>
      </Tabs.Group>
    </Container>
  );
};

export default QueuePage;
