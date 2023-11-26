import { BorrowingQueue } from "@definitions/types";
import { toReadableDatetime } from "@helpers/datetime";
import React, { FC } from "react";

type OngoingQueueTableProps = {
  queues: BorrowingQueue[];
};
const OngoingQueueTable: FC<OngoingQueueTableProps> = ({ queues }) => {
  return (
    <div className="overflow-x-auto mt-4">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Book</th>
            <th>Queued At</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {queues.map((item) => {
            return (
              <tr key={item.id}>
                <td>
                  <div className="font-semibold">{item.book.title}</div>
                  <div className="text-sm">{item.book.section.name}</div>
                </td>
                <td>{toReadableDatetime(item.createdAt ?? "")}</td>
                <td>
                  <button className="btn btn-sm btn-error">Cancel</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OngoingQueueTable;
