import CustomDatePicker from "@components/forms/CustomDatePicker";
import CustomSelect from "@components/forms/CustomSelect";
import { ButtonClasses, Input } from "@components/forms/Forms";
import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";
import axiosClient from "@definitions/configs/axios";
import { Audit } from "@definitions/types";
import { useQuery } from "@tanstack/react-query";
import { AiOutlineScan } from "react-icons/ai";
import { Link } from "react-router-dom";

const AuditPage = () => {
  const fetchAudits = async () => {
    try {
      const { data: response } = await axiosClient("/inventory/audits");
      return response?.data?.audits ?? [];
    } catch {
      return [];
    }
  };
  const { data: audits } = useQuery<Audit[]>({
    queryFn: fetchAudits,
    queryKey: ["audits"],
  });
  return (
    <>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5 flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">Inventory Audit</h1>
        <Link
          to="/books/new"
          className={ButtonClasses.PrimaryButtonDefaultClasslist}
        >
          New audit
        </Link>
      </div>

      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5 drop-shadow-md lg:rounded-md mx-auto">
        <Table>
          <Thead>
            <HeadingRow>
              <Th>Name</Th>
              <Th></Th>
            </HeadingRow>
          </Thead>
          <Tbody>
            {audits?.map((audit) => {
              return (
                <BodyRow key={audit.id}>
                  <Td>{audit.name}</Td>
                  <Td>
                    <Link to={`/inventory/audits/${audit.id}`}>
                      <AiOutlineScan className="text-blue-500 text-lg cursor-pointer"></AiOutlineScan>
                    </Link>
                  </Td>
                </BodyRow>
              );
            })}
          </Tbody>
        </Table>
      </div>
    </>
  );
};

export default AuditPage;
