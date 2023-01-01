import Select, { GroupBase, Props } from "react-select";
import { InputClasses } from "./Forms";

interface CustomSelectProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
> extends Props<Option, IsMulti, Group> {
  label?: string;
  error?: any;
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
      <label>{props.label}</label>
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
      <div className={InputClasses.LabelWrapperClasslist}>
        <small className={InputClasses.LabelClasslist}>{props.error}</small>
      </div>
    </>
  );
};

export default CustomSelect;
