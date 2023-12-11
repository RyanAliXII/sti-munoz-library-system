import Container from "@components/ui/container/Container";
import TableContainer from "@components/ui/table/TableContainer";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button, Checkbox, Datepicker, Select, Table } from "flowbite-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-toastify";

type GenerateReportForm = {
  from: string;
  to: string;
};
const ReportPage = () => {
  const { setForm, form } = useForm<GenerateReportForm>({
    initialFormData: {
      from: "",
      to: "",
    },
  });
  const { Post } = useRequest();
  const generateReport = useMutation({
    mutationFn: (form: GenerateReportForm) =>
      Post("/reports", form, {
        responseType: "blob",
      }),
    onSuccess: (response) => {
      toast.success("Report has been generated.");
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.download = "report.pdf";
      a.href = url;
      a.click();
    },
  });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    generateReport.mutate(form);
  };

  const [reportConfig, setReportConfig] = useState({
    clientStatistics: {
      enabled: false,
      from: "",
      to: "",
    },
    borrowedBooks: {
      enabled: false,
      from: "",
      to: "",
    },
    gameStatistics: {
      enabled: false,
      from: "",
      to: "",
    },
    deviceStatistics: {
      enabled: false,
      from: "",
      to: "",
    },
  });
  const handleConfigSelect = (
    event: ChangeEvent<HTMLInputElement>,
    key:
      | "clientStatistics"
      | "borrowedBooks"
      | "gameStatistics"
      | "deviceStatistics"
  ) => {
    const isChecked = event.target.checked;
    setReportConfig((prev) => ({
      ...prev,
      [key]: {
        enabled: isChecked,
      },
    }));
  };

  const handleDateSelection = () => {};

  return (
    <Container>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Report</Table.HeadCell>
            <Table.HeadCell>Frequency</Table.HeadCell>
            <Table.HeadCell>From</Table.HeadCell>
            <Table.HeadCell>To</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700 ">
            <Table.Row>
              <Table.Cell>
                <div className="flex gap-2">
                  <Checkbox
                    color="primary"
                    onChange={(event) => {
                      handleConfigSelect(event, "clientStatistics");
                    }}
                  />
                  Include Client Statistics
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Select disabled={!reportConfig.clientStatistics.enabled}>
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                  </Select>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Datepicker
                    disabled={!reportConfig.clientStatistics.enabled}
                  />
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Datepicker
                    disabled={!reportConfig.clientStatistics.enabled}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <div className="flex gap-2">
                  <Checkbox
                    color="primary"
                    onChange={(event) => {
                      handleConfigSelect(event, "borrowedBooks");
                    }}
                  />
                  Include Borrowed Books
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  {/* <Select disabled={!reportConfig.borrowedBooks.enabled}>
                    <option value="weekly">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="weekly">Monthly</option>
                  </Select> */}
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Datepicker disabled={!reportConfig.borrowedBooks.enabled} />
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Datepicker disabled={!reportConfig.borrowedBooks.enabled} />
                </div>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <div className="flex gap-2">
                  <Checkbox
                    color="primary"
                    onChange={(event) => {
                      handleConfigSelect(event, "gameStatistics");
                    }}
                  />
                  Include Game Statistics
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  {/* <Select disabled={!reportConfig.gameStatistics.enabled}>
                    <option value="weekly">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="weekly">Monthly</option>
                  </Select> */}
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Datepicker disabled={!reportConfig.gameStatistics.enabled} />
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Datepicker disabled={!reportConfig.gameStatistics.enabled} />
                </div>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <div className="flex gap-2">
                  <Checkbox
                    color="primary"
                    onChange={(event) => {
                      handleConfigSelect(event, "deviceStatistics");
                    }}
                  />
                  Include Device and Reservation Statistics
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  {/* <Select disabled={!reportConfig.deviceStatistics.enabled}>
                    <option value="weekly">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="weekly">Monthly</option>
                  </Select> */}
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Datepicker
                    disabled={!reportConfig.deviceStatistics.enabled}
                  />
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <Datepicker
                    disabled={!reportConfig.deviceStatistics.enabled}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </TableContainer>
      <Button type="submit" color="primary" className="mt-2">
        Generate Report
      </Button>
    </Container>
  );
};

export default ReportPage;
