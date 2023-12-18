import Container from "@components/ui/container/Container";
import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import TableContainer from "@components/ui/table/TableContainer";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useSwitch } from "@hooks/useToggle";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button, Checkbox, Table } from "flowbite-react";
import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import ReportPreviewModal from "./ReportPreviewModal";
type ReportConfigKeys =
  | "clientStatistics"
  | "borrowedBooks"
  | "gameStatistics"
  | "deviceStatistics";

const ReportPage = () => {
  const { Post } = useRequest();
  const reportPreview = useSwitch();
  const [reportUrl, setReportUrl] = useState<string>("");
  const generateReport = useMutation({
    mutationFn: (form: any) =>
      Post("/reports", form, {
        responseType: "blob",
      }),
    onSuccess: (response) => {
      toast.success("Report has been generated.");
      const url = URL.createObjectURL(response.data);
      setReportUrl(url);
      reportPreview.open();
    },
  });
  const {
    form: reportConfig,
    setErrors,
    setForm,
    errors,
  } = useForm({
    initialFormData: {
      clientStatistics: {
        enabled: false,
        frequency: "",
        from: "2023-12-12",
        to: "2023-12-12",
      },
      borrowedBooks: {
        enabled: false,
        from: "2023-12-12",
        to: "2023-12-12",
      },
      gameStatistics: {
        enabled: false,
        from: "2023-12-12",
        to: "2023-12-12",
      },
      deviceStatistics: {
        enabled: false,
        from: "2023-12-12",
        to: "2023-12-12",
      },
    },
  });

  const onSubmit = () => {
    // for (const [key, value] of Object.entries(reportConfig)) {
    //   if (value.enabled) {
    //     try {
    //       const parsedFrom = parse(value.from, "yyyy-MM-dd", new Date());
    //       let errs = {};
    //       if (!isValid(parsedFrom)) {
    //         errs = { ...errs, [`${key}.from`]: "Invalid date" };
    //       }
    //       const parsedTo = parse(value.to, "yyyy-MM-dd", new Date());
    //       if (!isValid(parsedTo)) {
    //         errs = { ...errs, [`${key}.from`]: "Invalid date" };
    //       }
    //       setErrors({ ...errs });
    //     } catch (err) {
    //       console.error(err);
    //     }
    //   }
    // }
    generateReport.mutate(reportConfig);
  };

  const handleConfigSelect = (
    event: ChangeEvent<HTMLInputElement>,
    key: ReportConfigKeys
  ) => {
    const isChecked = event.target.checked;

    const config = reportConfig[key];
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...config,
        enabled: isChecked,
      },
    }));
  };

  const handleFrom = (d: Date, key: ReportConfigKeys) => {
    const from = format(d, "yyyy-MM-dd");
    const config = reportConfig[key];
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...config,
        from: from,
      },
    }));
  };
  const handleTo = (d: Date, key: ReportConfigKeys) => {
    const from = format(d, "yyyy-MM-dd");
    const config = reportConfig[key];
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...config,
        to: from,
      },
    }));
  };
  const handleFrequency = (value: string, key: ReportConfigKeys) => {
    const config = reportConfig[key];
    setForm((prev) => ({
      ...prev,
      [key]: {
        ...config,
        frequency: value,
      },
    }));
  };
  return (
    <Container>
      <TableContainer>
        <Table>
          <Table.Head>
            <Table.HeadCell>Report</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
            <Table.HeadCell>From</Table.HeadCell>
            <Table.HeadCell>To</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark:divide-gray-700 ">
            <Table.Row>
              <Table.Cell>
                <div className="flex gap-2">
                  <Checkbox
                    checked={reportConfig.clientStatistics.enabled}
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
                  {/* <Select
                    value={reportConfig.clientStatistics.frequency}
                    disabled={!reportConfig.clientStatistics.enabled}
                    onChange={(event) => {
                      const value = event.target.value;
                      handleFrequency(value, "clientStatistics");
                    }}
                  >
                    <option value=""></option>
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                  </Select> */}
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <CustomDatePicker
                    selected={new Date(reportConfig.clientStatistics.from)}
                    onChange={(d) => {
                      if (d) handleFrom(d, "clientStatistics");
                    }}
                    error={errors?.["clientStatistics.from"]}
                    disabled={!reportConfig.clientStatistics.enabled}
                  />
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <CustomDatePicker
                    selected={new Date(reportConfig.clientStatistics.to)}
                    onChange={(d) => {
                      if (d) handleTo(d, "clientStatistics");
                    }}
                    error={errors?.["clientStatistics.to"]}
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
                  <CustomDatePicker
                    selected={new Date(reportConfig.borrowedBooks.from)}
                    onChange={(date) => {
                      if (date) handleFrom(date, "borrowedBooks");
                    }}
                    disabled={!reportConfig.borrowedBooks.enabled}
                  />
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <CustomDatePicker
                    selected={new Date(reportConfig.borrowedBooks.to)}
                    onChange={(date) => {
                      if (date) handleTo(date, "borrowedBooks");
                    }}
                    disabled={!reportConfig.borrowedBooks.enabled}
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
                  <CustomDatePicker
                    selected={new Date(reportConfig.gameStatistics.from)}
                    onChange={(date) => {
                      if (date) handleFrom(date, "gameStatistics");
                    }}
                    disabled={!reportConfig.gameStatistics.enabled}
                  />
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <CustomDatePicker
                    selected={new Date(reportConfig.gameStatistics.to)}
                    onChange={(date) => {
                      if (date) handleTo(date, "gameStatistics");
                    }}
                    disabled={!reportConfig.gameStatistics.enabled}
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
                  <CustomDatePicker
                    selected={new Date(reportConfig.deviceStatistics.from)}
                    onChange={(date) => {
                      if (date) handleFrom(date, "deviceStatistics");
                    }}
                    disabled={!reportConfig.deviceStatistics.enabled}
                  />
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="flex gap-2">
                  <CustomDatePicker
                    selected={new Date(reportConfig.deviceStatistics.to)}
                    onChange={(date) => {
                      if (date) handleTo(date, "deviceStatistics");
                    }}
                    disabled={!reportConfig.deviceStatistics.enabled}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </TableContainer>
      <Button onClick={onSubmit} color="primary" className="mt-2">
        Generate Report
      </Button>
      <ReportPreviewModal
        url={reportUrl}
        isOpen={reportPreview.isOpen}
        closeModal={reportPreview.close}
      />
    </Container>
  );
};

export default ReportPage;
