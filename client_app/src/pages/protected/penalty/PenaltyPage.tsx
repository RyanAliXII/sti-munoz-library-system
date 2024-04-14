import { usePenalties, usePenaltyBill } from "@hooks/data-fetching/penalty";
import { toReadableDatetime } from "@helpers/datetime";
import { AiOutlineDownload } from "react-icons/ai";
import { useEffect, useState } from "react";
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
        <table className="table w-full">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {penalties?.map((penalty) => {
              return (
                <tr key={penalty.id}>
                  <td>{penalty.description}</td>
                  <td>
                    {penalty.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {penalty.isSettled ? (
                      <span className="text-success">Settled</span>
                    ) : (
                      <span className="text-error">Unsettled</span>
                    )}
                  </td>
                  <td>{toReadableDatetime(penalty.createdAt)}</td>
                  <td>
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PenaltyPage;
