export type User = {
    firstname?: string;
    lastname?: string;
    email?: string;
    id: string;
    image?: Blob;
  };

  export interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
  }
  export interface EditModalProps <T> extends ModalProps  {
    formData: T
  }