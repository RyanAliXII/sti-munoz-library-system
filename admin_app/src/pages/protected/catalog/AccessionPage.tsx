import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { Input } from "@components/ui/form/Input";
import {
  HeadingRow,
  Th,
  Table,
  Thead,
  Tbody,
  BodyRow,
  Td,
} from "@components/ui/table/Table";
import Container, {
  ContainerNoBackground,
} from "@components/ui/container/Container";
import axiosClient from "@definitions/configs/axios";
import { DetailedAccession } from "@definitions/types";
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
  const { data: accessions } = useQuery<DetailedAccession[]>({
    queryFn: fetchAccessions,
    queryKey: ["accessions"],
  });
  return (
    <>
      <ContainerNoBackground>
        <h1 className="text-3xl font-bold text-gray-700">Accession</h1>
      </ContainerNoBackground>
      <ContainerNoBackground className="flex gap-2">
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
      </ContainerNoBackground>
      <Container className="p-0 lg:p-0">
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
                <BodyRow key={`${accession.copyNumber}_${accession.bookId}`}>
                  <Td>{accession.number}</Td>
                  <Td>{accession.book.title}</Td>
                  <Td>{accession.book.section.name}</Td>
                  <Td>{accession.book.yearPublished}</Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
      </Container>
    </>
  );
};

export default AccessionPage;
