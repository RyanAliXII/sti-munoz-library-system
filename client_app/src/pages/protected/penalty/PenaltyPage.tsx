import { usePenalties, usePenaltyBill } from "@hooks/data-fetching/penalty";
import { toReadableDatetime } from "@helpers/datetime";
import { AiOutlineDownload } from "react-icons/ai";
import { useEffect, useState } from "react";
import { Table } from "flowbite-react";
const PenaltyPage = () => {
  const [penaltyId, setPenaltyId] = useState("");
  const { data: penalties } = usePenalties();
  const { data: billUrl, refetch } = usePenaltyBill({
    queryKey: ["penaltyBill", penaltyId],
  });
  useEffect(() => {
    if ((billUrl?.length ?? 0) > 0) {
      const a = document.createElement("a");
      a.href = billUrl ?? "";
      a.download = `${Date.now()}.pdf`;
      a.click();
    }
  }, [billUrl]);

  return (
    <div className="py-4 w-11/12 mx-auto lg:w-9/12">
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
              <Table.HeadCell>Description</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Created At</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700">
            {penalties?.map((penalty) => {
              return (
                <Table.Row key={penalty.id}>
                  <Table.Cell>{penalty.description}</Table.Cell>
                  <Table.Cell>
                    {penalty.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Table.Cell>
                  <Table.Cell>
                    {penalty.isSettled ? (
                      <span className="text-success">Settled</span>
                    ) : (
                      <span className="text-error">Unsettled</span>
                    )}
                  </Table.Cell>
                  <Table.Cell>{toReadableDatetime(penalty.createdAt)}</Table.Cell>
                  <Table.Cell>
                    <button
                      className="btn  btn-primary btn-xs"
                      onClick={() => {
                        setPenaltyId(penalty.id ?? "");
                        setTimeout(() => {
                          refetch();
                        }, 200);
                      }}
                    >
                      <div className="flex gap-1 items-center">
                        <AiOutlineDownload className="text-lg" />
                        Download PDF
                      </div>
                    </button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export default PenaltyPage;
