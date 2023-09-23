import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { PrimaryButton } from "@components/ui/button/Button";
import {
  Table,
  HeadingRow,
  Tbody,
  Th,
  Thead,
} from "@components/ui/table/Table";
import React from "react";
import { AiOutlinePlus } from "react-icons/ai";

const ScannerAccount = () => {
  return (
    <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 -md lg:rounded-md mx-auto mb-10">
      <div className="w-full flex justify-between mb-5">
        <h1 className="text-2xl">Scanner Account</h1>
        <PrimaryButton className="flex items-center gap-2">
          <AiOutlinePlus />
          New Account
        </PrimaryButton>
      </div>

      <div>
        <LoadingBoundaryV2 isError={false} isLoading={false}>
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Username</Th>
                <Th>Description</Th>
                <Th></Th>
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

export default ScannerAccount;
