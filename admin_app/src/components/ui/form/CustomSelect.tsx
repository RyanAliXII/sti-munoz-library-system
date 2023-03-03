import Select, { GroupBase, Props } from "react-select";
import { InputClasses } from "./Input";

interface CustomSelectProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
> extends Props<Option, IsMulti, Group> {
  label?: string;
  error?: any;
  wrapperclass?: string;
}
const CustomSelect = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: CustomSelectProps<Option, IsMulti, Group>
) => {
  return (
    <>
      <label className="text-gray-600 text-sm">{props.label}</label>
      <div className={`w-full ${props.wrapperclass}`}>
        <Select
          classNames={{
            option: (props) => {
              return props.isSelected ? "bg-yellow-400" : "";
            },
          }}
          {...{
            ...props,
            styles: {
              control: (baseStyles) => ({
                ...baseStyles,
                borderColor: props.error ? "red" : "none",
                boxShadow: "none",
                outline: "none",
                ":hover": {
                  borderColor: "#facc15",
                  cursor: "pointer",
                  boxShadow: "none",
                },
                ":focus": {
                  borderColor: "#facc15",
                  boxShadow: "none",
                },
              }),
              option: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "none",
              }),
            },
          }}
        ></Select>

        <div>
          <small className="text-red-400">{props.error}</small>
        </div>
      </div>
    </>
  );
};

export default CustomSelect;
