import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  HtmlHTMLAttributes,
  ReactNode,
} from "react";
type HeadingType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type DividerProps = {
  heading?: HeadingType;
  headingProps?: HtmlHTMLAttributes<HTMLHeadingElement>;
  hrProps?: DetailedHTMLProps<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
  children?: ReactNode;
};

const Divider = (props: DividerProps) => {
  let heading;
  if (props.heading) {
    heading = React.createElement(props.heading, {
      ...props.headingProps,
      children: props.children,
    });
  }
  return (
    <>
      {heading}
      <hr {...props.hrProps}></hr>
    </>
  );
};

export default Divider;
