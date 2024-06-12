const Inquire = () => {
  return (
    <div
      className="h-screen w-full flex flex-col items-center  justify-center dark:bg-gray-800"
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    ></div>
  );
};

export default Inquire;
