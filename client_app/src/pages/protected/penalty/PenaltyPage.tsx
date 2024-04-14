const PenaltyPage = () => {
  return (
    <div className="py-4 w-11/12 mx-auto lg:w-9/12">
      <div className="overflow-x-auto">
        <table className="table w-full">
          {/* head */}
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created At</th>
              <th></th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  );
};

export default PenaltyPage;
