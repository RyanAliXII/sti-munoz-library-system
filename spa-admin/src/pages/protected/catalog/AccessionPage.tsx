import CustomDatePicker from "@components/forms/CustomDatePicker";
import CustomSelect from "@components/forms/CustomSelect";
import { Input } from "@components/forms/Forms";
import {
  HeadingRow,
  Th,
  Table,
  Thead,
  Tbody,
  BodyRow,
  Td,
} from "@components/table/Table";
import axiosClient from "@definitions/configs/axios";
import { Accession } from "@definitions/types";
import { useQuery } from "@tanstack/react-query";

const AccessionPage = () => {
  const fetchAccessions = async () => {
    try {
      const { data: response } = await axiosClient.get("/books/accessions");
      return response?.data?.accessions ?? [];
    } catch {
      return [];
    }
  };
  const { data: accessions } = useQuery<Accession[]>({
    queryFn: fetchAccessions,
    queryKey: ["accessions"],
  });
  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5 flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">Accession</h1>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 first-letter: -md lg:rounded-md mx-auto mb-4 flex gap-2">
        <div className="w-5/12">
          <Input type="text" label="Search" placeholder="Search.."></Input>
        </div>
        <div>
          <CustomDatePicker
            label="Year Published"
            wrapperclass="flex flex-col"
            selected={new Date()}
            onChange={() => {}}
            showYearPicker
            dateFormat="yyyy"
            yearItemNumber={9}
          />
        </div>
        <div className="w-3/12">
          <CustomSelect label="Section" />
        </div>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 -md lg:rounded-md mx-auto">
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Accession Number</Th>
              <Th>Book Title</Th>
              <Th>Section</Th>
              <Th>Year Published</Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {accessions?.map((accession) => {
              return (
                <BodyRow key={`${accession.copyNumber}_${accession.title}`}>
                  <Td>{accession.number}</Td>
                  <Td>{accession.title}</Td>
                  <Td>{accession.section}</Td>
                  <Td>{accession.yearPublished}</Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
      </div>
    </>
  );
};

export default AccessionPage;
