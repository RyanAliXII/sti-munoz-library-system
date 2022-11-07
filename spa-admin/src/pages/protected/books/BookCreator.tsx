import React from "react";

const BookCreator = () => {
  return (
    <div className="w-full h-full">
        <BookCreatorForm></BookCreatorForm>
    </div>
  );
};

const BookCreatorForm = ()=>{
return (
    <form>
    <div className="mb-3 xl:w-96">
      <label
        htmlFor="exampleFormControlInpu3"
        className="form-label inline-block mb-2 text-gray-700"
      >
        Title
      </label>
      <input
        type="text"
        className="
      form-control
      block
      w-full
      px-3
      py-1.5
      text-base
      font-normal
      text-gray-700
      bg-white bg-clip-padding
      border border-solid border-gray-300
      rounded
      transition
      ease-in-out
      m-0
      focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
    "
        id="exampleFormControlInput3"
        placeholder="Default input"
      />
    </div>
     <div className="mb-3 xl:w-96">
      <label
        htmlFor="exampleFormControlInpu3"
        className="form-label inline-block mb-2 text-gray-700"
      >
        Description
      </label>
      <textarea
        className="
      form-control
      block
      w-full
      px-3
      py-1.5
      text-base
      font-normal
      text-gray-700
      bg-white bg-clip-padding
      border border-solid border-gray-300
      rounded
      transition
      ease-in-out
      m-0
      focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
    "
        id="exampleFormControlInput3"
        placeholder="Default input"
      />
    </div>
    <div className="mb-3 xl:w-96">
      <label
        htmlFor="exampleFormControlInpu3"
        className="form-label inline-block mb-2 text-gray-700"
      >
        Number of copies
      </label>
      <input
      type="number"
      className="
      form-control
      block
      w-full
      px-3
      py-1.5
      text-base
      font-normal
      text-gray-700
      bg-white bg-clip-padding
      border border-solid border-gray-300
      rounded
      transition
      ease-in-out
      m-0
      focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
    "
        id="exampleFormControlInput3"
        placeholder="Default input"
      />
    </div>
  </form>
)
}

export default BookCreator;
