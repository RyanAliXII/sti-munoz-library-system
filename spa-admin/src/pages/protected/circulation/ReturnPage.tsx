import React from "react";

const ReturnPage = () => {
  return (

    <>
    <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5  flex gap-2">
        <h1 className="text-3xl font-bold text-gray-700">Borrow Book</h1>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5  lg:rounded-md mx-auto mb-4 gap-2 border border-gray-100">
        <h2 className="text-xl mb-2"> Borrower</h2>
        <div className="w-full flex items-center gap-2">
          <ClientSearchBox setClient={setClient} form={checkout} />
          <SecondaryButton className="h-9 mt-6 flex justify-center">
            <AiOutlineScan className="text-white inline text-lg " />
          </SecondaryButton>
        </div>
        <div className="mt-5">
          <Table>
            <Thead>
              <HeadingRow>
                <Th></Th>
                <Th>Client</Th>
                <Th>Email</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {checkout.client?.id?.length ?? 0 > 0 ? (
                <BodyRow>
                  <Td>
                    <ProfileIcon
                      givenName={checkout.client.givenName}
                      surname={checkout.client.surname}
                    />
                  </Td>
                  <Td>{checkout.client.displayName}</Td>
                  <Td>{checkout.client.email}</Td>
                </BodyRow>
              ) : (
                <BodyRow>
                  <Td>
                    <span>No client selected.</span>
                  </Td>
                </BodyRow>
              )}
            </Tbody>
          </Table>
        </div>
      </div>
      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5  lg:rounded-md mx-auto mb-4  gap-2 border border-gray-100">
        <h2 className="text-xl mb-2"> Books to borrow</h2>
        <div className="w-full flex items-center gap-2">
          <BookSearchBox selectBook={selectBook} />
          <SecondaryButton className="h-9 mt-6 flex justify-center">
            <AiOutlineScan className="text-white inline text-lg " />
          </SecondaryButton>
        </div>
        <div className="mt-5">
          <Table>
            <Thead>
              <HeadingRow>
                <Th>Book title</Th>
                <Th>Copy number</Th>
                <Th>Accession number</Th>
              </HeadingRow>
            </Thead>
            <Tbody>
              {checkout.accessions?.map((accession) => {
                return (
                  <BodyRow key={`${accession.bookId}_${accession.copyNumber}`}>
                    <Td>{accession.title}</Td>
                    <Td>{accession.copyNumber}</Td>
                    <Td>{accession.number}</Td>
                  </BodyRow>
                );
              })}
            </Tbody>
          </Table>
        </div>
      </div>

      <div className="w-full lg:w-11/12 bg-white p-6 lg:p-5  lg:rounded-md mx-auto mb-4  gap-2 border border-gray-100">
        <h2 className="text-xl mb-2"> Due date</h2>
        <div>
          <CustomDatePicker
            name="dueDate"
            error={errors?.dueDate}
            minDate={new Date()}
            onChange={(date) => {
              if (!date) return;
              setForm((prevForm) => ({
                ...prevForm,
                dueDate: date.toISOString(),
              }));
            }}
            selected={new Date(checkout.dueDate)}
          />
        </div>
      </div>
      <div className="w-full lg:w-11/12 p-6 lg:p-2 mx-auto mb-5  flex gap-2">
        <PrimaryButton onClick={proceedCheckout}>
          Proceed to checkout
        </PrimaryButton>
      </div>
      <BookCopySelectionModal
        book={selectedBook}
        closeModal={closeCopySelection}
        isOpen={isCopySelectionOpen}
        updateAccessionsToBorrow={updateAccessionsToBorrow}
        form={checkout}
      />
    </>
    
    </>
  )
};

export default ReturnPage;
