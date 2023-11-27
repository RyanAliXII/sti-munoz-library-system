import Container from "@components/ui/container/Container";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button, Datepicker, Label } from "flowbite-react";
import { FormEvent } from "react";
import { Form } from "react-router-dom";
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
    mutationFn: (form: GenerateReportForm) => Post("/reports", form),
    onSuccess: () => {
      toast.success("Report has been generated.");
    },
  });
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    generateReport.mutate(form);
  };
  const onChangeFrom = (date: Date) => {
    setForm((prev) => ({ ...prev, from: format(date, "yyyy-MM-dd") }));
  };
  const onChangeTo = (date: Date) => {
    setForm((prev) => ({ ...prev, to: format(date, "yyyy-MM-dd") }));
  };
  return (
    <Container>
      <form onSubmit={onSubmit}>
        <div className="flex gap-2 py-4">
          <Button color="primary" outline>
            Monthly
          </Button>
          <Button color="light">Weekly</Button>
        </div>
        <div className="py-2">
          <Label>From</Label>
          <Datepicker
            onSelectedDateChanged={onChangeFrom}
            name="from"
            maxDate={new Date()}
          />
        </div>
        <div className="py-2">
          <Label>To</Label>
          <Datepicker
            onSelectedDateChanged={onChangeTo}
            name="to"
            maxDate={new Date()}
          />
        </div>
        <Button type="submit" color="primary" className="mt-2">
          Generate Report
        </Button>
      </form>
    </Container>
  );
};

export default ReportPage;
