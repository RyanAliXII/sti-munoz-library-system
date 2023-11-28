import { toReadableDatetime } from "@helpers/datetime";
import { useQueueHistory } from "@hooks/data-fetching/borrowing-queue";

const QueueHistoryTable = () => {
  const { data: items } = useQueueHistory({
    queryKey: ["queueHistory"],
  });
  return (
    <div className="overflow-x-auto mt-4">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Book</th>
            <th>Queued At</th>
            <th>Dequeued At</th>
          </tr>
        </thead>
        <tbody>
          {items?.map((item) => {
            return (
              <tr key={item.id}>
                <td>
                  <div className="font-semibold">{item.book.title}</div>
                  <div className="text-sm">{item.book.section.name}</div>
                </td>
                <td>{toReadableDatetime(item.createdAt ?? "")}</td>
                <td>{toReadableDatetime(item.dequeuedAt ?? "")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default QueueHistoryTable;
