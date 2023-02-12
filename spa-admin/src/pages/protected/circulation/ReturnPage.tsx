import React from "react";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";
import { InputClasses } from "@components/forms/Forms";
const ReturnPage = () => {
  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5  flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">Return</h1>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5  lg:rounded-md mx-auto mb-4 gap-2 border border-gray-100">
        <SearchBox></SearchBox>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5  lg:rounded-md mx-auto mb-4  gap-2 border border-gray-100">
        <div className="mt-5">
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Book title</Th>
                <Th>Copy number</Th>
                <Th>Accession number</Th>
              </HeadingRow>
            </Thead>
            <Tbody></Tbody>
          </Table>
        </div>
      </div>
    </>
  );
};
const SearchBox = () => {
  return (
    <>
      <label className={InputClasses.LabelClasslist}>Search</label>
      <input
        type="text"
        className={InputClasses.InputDefaultClasslist}
        placeholder="Enter book title or client name"
      />
    </>
  );
};
export default ReturnPage;
