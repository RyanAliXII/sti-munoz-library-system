import { useActiveQueues } from "@hooks/data-fetching/borrowing-queue";
import { useState } from "react";
import OngoingQueueTable from "./OngoingQueueTable";
import QueueHistoryTable from "./QueueHistoryTable";

const QueuePage = () => {
  const { data } = useActiveQueues({});
  const [tab, setTab] = useState<1 | 2>(1);
  const changeTab = (tab: 1 | 2) => {
    setTab(tab);
  };

  return (
    <div className="py-4 w-11/12 mx-auto lg:w-9/12">
      <div className="tabs">
        <a
          onClick={() => {
            changeTab(1);
          }}
          className={`tab tab-lifted ${tab == 1 ? "tab-active" : ""}`}
        >
          Ongoing Queues
        </a>
        <a
          onClick={() => {
            changeTab(2);
          }}
          className={`tab tab-lifted ${tab == 2 ? "tab-active" : ""}`}
        >
          Queue History
        </a>
      </div>
      <section className={`${tab == 1 ? "" : "hidden"}`}>
        <OngoingQueueTable queues={data?.queues ?? []} />
      </section>
      <section className={`${tab == 2 ? "" : "hidden"}`}>
        <QueueHistoryTable />
      </section>
    </div>
  );
};

export default QueuePage;
