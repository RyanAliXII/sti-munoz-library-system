import { useActiveQueues } from "@hooks/data-fetching/borrowing-queue";
import { TabItem, Tabs } from "flowbite-react";
import OngoingQueueTable from "./OngoingQueueTable";
import QueueHistoryTable from "./QueueHistoryTable";
const QueuePage = () => {
  const { data } = useActiveQueues({});
  return (
    <div className="py-4 w-11/12 mx-auto lg:w-9/12">
      <Tabs>
        <TabItem color="light" title="Ongoing Queues">
          <OngoingQueueTable queues={data?.queues ?? []} />
        </TabItem>
        <TabItem title="Queue History">
        <QueueHistoryTable />
        </TabItem>
      </Tabs>
    </div>
  );
};

export default QueuePage;
