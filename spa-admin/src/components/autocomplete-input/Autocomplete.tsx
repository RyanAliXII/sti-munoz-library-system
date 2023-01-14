import React, { ChangeEventHandler, useEffect, useRef } from "react";
import { BaseProps } from "@definitions/props.definition";
import { useToggleManual } from "@hooks/useToggle";

interface AutocompleteProps extends BaseProps {
  className?: string;
  placeholder?: string;
  onInput: ChangeEventHandler<HTMLInputElement>;
}
const Autocomplete: React.FC<AutocompleteProps> = ({
  placeholder,
  className,
  onInput,
  children,
}) => {
  const { value: open, set: setOpen } = useToggleManual(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const resultParent = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const handleWindowClick = (event: MouseEvent) => {
      if (event.target != searchInput.current) {
        setOpen(false);
      }
    };
    const handleFocus = () => {
      setOpen(true);
    };
    searchInput.current?.addEventListener("focus", handleFocus);

    window.addEventListener("click", handleWindowClick);

    return () => {
      searchInput.current?.removeEventListener("focus", handleFocus);
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);
  return (
    <>
      <input
        type="text"
        name="search"
        placeholder={placeholder ?? ""}
        className={className ?? ""}
        onChange={onInput}
        ref={searchInput}
      ></input>
      <div className="w-full relative top-4">
        {open ? (
          <ul
            className="list-none absolute bg-white w-full max-h-40 overflow-y-scroll"
            ref={resultParent}
          >
            {children}
          </ul>
        ) : null}
      </div>
    </>
  );
};

export default Autocomplete;
