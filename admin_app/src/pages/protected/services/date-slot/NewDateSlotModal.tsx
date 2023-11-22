import CustomDatePicker from "@components/ui/form/CustomDatePicker";
import CustomSelect from "@components/ui/form/CustomSelect";
import { ModalProps, TimeSlotProfile } from "@definitions/types";
import { useNewDateSlots } from "@hooks/data-fetching/date-slot";
import { useTimeSlotProfiles } from "@hooks/data-fetching/time-slot-profile";

import { useForm } from "@hooks/useForm";
import { format } from "date-fns";
import { Button, Modal } from "flowbite-react";
import { FC, FormEvent } from "react";
import { FaSave } from "react-icons/fa";
import { SingleValue } from "react-select";
import { toast } from "react-toastify";
import { object, string } from "yup";

type DateSlotForm = {
  from: string;
  to: string;
  profileId: string;
};
const NewDateSlotModal: FC<ModalProps> = ({ isOpen, closeModal }) => {
  const { removeFieldError, setForm, form, setErrors, errors, validate } =
    useForm<DateSlotForm>({
      initialFormData: {
        from: format(new Date(), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd"),
        profileId: "",
      },
      schema: object({
        profileId: string()
          .required("Time slot profile is required.")
          .uuid("Time slot profile is required."),
      }),
    });
  const { data: profiles } = useTimeSlotProfiles({});
  const handleFromInput = (date: Date) => {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    removeFieldError("from");
    setForm((prev) => ({ ...prev, from: dateStr }));
  };
  const handleToInput = (date: Date) => {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    removeFieldError("to");
    setForm((prev) => ({ ...prev, to: dateStr }));
  };
  const handleTimeSlotProfileSelect = (
    profile: SingleValue<TimeSlotProfile>
  ) => {
    if (!profile) return;
    removeFieldError("profileId");
    setForm((prev) => ({ ...prev, profileId: profile.id }));
  };
  const newSlots = useNewDateSlots({
    onSuccess: () => {
      closeModal();
      toast.success("New slots have been added.");
    },
    onError: (error) => {
      if (error.response?.status === 400) {
        const { data } = error.response.data;
        if (data?.errors) {
          setErrors(data?.errors);
          return;
        }
      }
      toast.error("Unknown error occured.");
    },
  });
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      const slot = await validate();
      if (!slot) return;
      newSlots.mutate(slot);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Modal show={isOpen} onClose={closeModal} dismissible size="lg">
      <Modal.Header>New Slots</Modal.Header>
      <Modal.Body className="overflow-visible">
        <form onSubmit={onSubmit}>
          <div className="py-2">
            <CustomDatePicker
              error={errors?.from}
              selected={new Date(form.from)}
              minDate={new Date()}
              label="From"
              onChange={handleFromInput}
            />
          </div>
          <div className="pb-3">
            <CustomDatePicker
              error={errors?.to}
              selected={new Date(form.to)}
              minDate={new Date()}
              label="To"
              onChange={handleToInput}
            />
          </div>
          <div className="pb-3">
            <CustomSelect
              error={errors?.profileId}
              options={profiles ?? []}
              onChange={handleTimeSlotProfileSelect}
              label="Time Slot Profile"
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option?.id?.toString() ?? ""}
            />
          </div>
          <Button color="primary" type="submit">
            <div className="flex items-center gap-2">
              <FaSave />
              Save
            </div>
          </Button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default NewDateSlotModal;
