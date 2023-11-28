import { object, string } from "yup";

export const ReservationValidation = object({
  dateSlotId: string()
    .required("Date slot is required")
    .uuid("Date slot is required."),
  timeSlotId: string()
    .required("Time slot is required")
    .uuid("Time slot is required."),
  deviceId: string().required("Device is required").uuid("Device is required."),
});
