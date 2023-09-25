import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import {
  HeadingRow,
  Table,
  Tbody,
  Th,
  Thead,
} from "@components/ui/table/Table";

const ClientLogPage = () => {
  return (
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10">
      <div className="w-full flex justify-between mb-5"></div>

      <div>
        <LoadingBoundaryV2 isError={false} isLoading={false}>
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Created At</Th>
                <Th>Client</Th>
                <Th>Scanner</Th>
                <Th></Th>
              </HeadingRow>
            </Thead>
            <Tbody></Tbody>
          </Table>
        </LoadingBoundaryV2>
      </div>
    </div>
  );
};

export default ClientLogPage;
