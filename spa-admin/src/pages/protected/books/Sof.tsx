import React from "react";
import { PrimaryButton } from "../../../components/forms/Forms";

const Sof = () => {
  return (
    <>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-10 drop-shadow-md lg:rounded-md mx-auto">
        <div className="mb-4">
          <h1 className="text-3xl font-bold ">Source of Funds</h1>
        </div>
        <div className="mb-4">
          <PrimaryButton
            buttonText="Add Source"
            // props={{ onClick: openAddModal }}
          ></PrimaryButton>
        </div>
      </div>
    </>
  );
};

export default Sof;
