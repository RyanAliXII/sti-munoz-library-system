import { number, object, string } from "yup";

export const AddPenaltyValidation = object({
  accountId: string().uuid().required("Account  is required."),
  amount: number()
    .required("Amount is required.")
    .min(1, "Amount must be greater than 0")
    .typeError("Invalid amount value."),
  description: string().required("Description is required."),
  item: string().required("Item is required."),
});
export const EditPenaltyValidation = object({
  id: string().required().uuid(),
  accountId: string().uuid().required("Account  is required."),
  item: string().required("Item is required."),
  amount: number()
    .required("Amount is required.")
    .min(1, "Amount must be greater than 0")
    .typeError("Invalid amount value."),
  description: string().required("Description is required."),
});
export const PenaltyClassificationSchema = object({
  name: string(),
  amount: number().typeError("Invalid amount value."),
  describe: string(),
});
