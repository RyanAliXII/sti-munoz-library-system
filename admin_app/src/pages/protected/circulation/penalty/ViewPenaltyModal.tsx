import { LoadingBoundaryV2 } from "@components/loader/LoadingBoundary";
import { ModalProps } from "@definitions/types";
import { usePenaltyBill } from "@hooks/data-fetching/penalty";
import { Modal } from "flowbite-react";
import { useEffect } from "react";
interface EditPenaltyModalProps extends ModalProps {
  penaltyId: string;
}
const ViewPenaltyModal = (props: EditPenaltyModalProps) => {
  const {
    data: billUrl,
    refetch,
    isError,
    isFetching,
  } = usePenaltyBill({
    queryKey: ["penaltyBill", props.penaltyId ?? ""],
  });
  useEffect(() => {
    if (props.penaltyId != "") {
      refetch();
    }
  }, [props.penaltyId]);
  useEffect(() => {
    console.log(billUrl);
  }, [billUrl]);
  return (
    <Modal
      dismissible
      show={props.isOpen}
      onClose={props.closeModal}
      size="4xl"
    >
      <Modal.Header></Modal.Header>
      <Modal.Body className="overflow-x-scroll small-scroll">
        <LoadingBoundaryV2 isLoading={isFetching} isError={isError}>
          <iframe src={billUrl} width="800px" height="800" />
        </LoadingBoundaryV2>
      </Modal.Body>
    </Modal>
  );
};

export default ViewPenaltyModal;
