import { forwardRef } from "react";

type FieldRowProps = {
  isRequired?: boolean;
  label?: string;
  children?: React.ReactNode;
  fieldDetails?: string;
  formGroup?: string;
};
export const FieldRow = forwardRef<HTMLDivElement, FieldRowProps>(
  (
    { isRequired = false, fieldDetails, label = "", children, formGroup = "" },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="lg:grid lg:grid-cols-9 gap-2 lg:mb-8"
        form-group={formGroup}
      >
        <div className="flex justify-end mb-3 flex-col h-14 lg:mb-0 lg:col-span-2 lg:justify-center">
          <div className="h-7 flex items-center gap-2">
            <label className="font-semibold text-sm text-gray-600 ">
              {label}
            </label>

            {isRequired && (
              <small className="text-gray-600 p-1 rounded bg-gray-200">
                Required
              </small>
            )}
          </div>
          <div>
            {fieldDetails && (
              <small className="text-gray-500 hidden lg:block">
                {fieldDetails}
              </small>
            )}
          </div>
        </div>

        <div className="col-span-7">{children}</div>
      </div>
    );
  }
);
