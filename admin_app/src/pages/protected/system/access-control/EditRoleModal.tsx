import {
  LightOutlineButton,
  PrimaryButton,
} from "@components/ui/button/Button";
import Divider from "@components/ui/divider/Divider";
import { Input } from "@components/ui/form/Input";
import { ModalProps, Permission, Role } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import React, {
  BaseSyntheticEvent,
  Ref,
  useEffect,
  useMemo,
  useRef,
} from "react";
import Modal from "react-responsive-modal";
import { toast } from "react-toastify";
import { RoleSchemaValidation } from "../schema";
import { apiScope } from "@definitions/configs/msal/scopes";

export interface EditModalProps<T> extends ModalProps {
  formData: T;
}
const EditRoleModal = ({
  closeModal,
  isOpen,
  formData,
}: EditModalProps<Role>) => {
  const { Get, Put } = useRequest();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const {
    form,
    handleFormInput,
    setForm,
    resetForm,
    validate,
    errors,
    registerFormGroup,
  } = useForm<Role>({
    initialFormData: {
      name: "",
      permissions: [],
    },
    scrollToError: true,
    parentElementScroll: modalRef,
    schema: RoleSchemaValidation,
  });
  useEffect(() => {
    setForm({ ...formData });
  }, [formData]);
  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      const role = await validate();
      if (!role) return;
      updateRole.mutate(role);
    } catch {}
  };

  const isCreateButtonDisabled =
    form.permissions.length === 0 || form.name.length === 0;
  const queryClient = useQueryClient();
  const fetchPermissions = async () => {
    try {
      const { data: response } = await Get("/system/modules", {}, [
        apiScope("AccessControl.Role.Read"),
      ]);
      return response?.data?.permissions ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const updateRole = useMutation({
    mutationFn: (role: Role) =>
      Put(`/system/roles/${role?.id}`, role, {}, [
        apiScope("AccessControl.Role.Add"),
      ]),
    onSuccess: () => {
      toast.success("Role has been created Successfully");
      queryClient.invalidateQueries(["roles"]);
    },
    onError: () => {
      toast.error(ErrorMsg.New);
    },
    onSettled: () => {
      resetForm();
      closeModal();
    },
  });

  const { data: permissions } = useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });
  const selectedPermissions = useMemo(() => {
    return form.permissions.reduce<Map<number, boolean>>((a, p) => {
      a.set(p.id, true);
      return a;
    }, new Map<number, boolean>());
  }, [form]);

  if (!isOpen) return null;
  return (
    <Modal
      center
      ref={modalRef}
      onClose={closeModal}
      open={isOpen}
      showCloseIcon={false}
      styles={{
        modal: {
          maxHeight: "800px",
        },
      }}
      classNames={{ modal: "w-11/12 md:w-10/12 lg:w-11/12 rounded" }}
    >
      <form onSubmit={submit}>
        <div className="w-full mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-semibold">Create role</h1>
          </div>
          <Input
            type="text"
            ref={registerFormGroup("name")}
            name="name"
            onChange={handleFormInput}
            value={form.name}
            label="Role name"
            error={errors?.name}
            placeholder="e.g Librarian, Assistant Librarian, Staff"
          ></Input>

          <div>
            <h2 className="text-lg py-2 font-semibold ml-1 mt-4">
              Role Access Level
            </h2>
            <div className="px-2">
              <ul className="list-none px-1 ">
                {permissions?.map((permission) => {
                  const isChecked = selectedPermissions.has(permission.id);
                  return (
                    <React.Fragment key={permission.id}>
                      <li
                        className="grid grid-cols-3 px-1 py-1 cursor-pointer"
                        onClick={() => {
                          if (!isChecked) {
                            setForm((prev) => ({
                              ...prev,
                              permissions: [...prev.permissions, permission],
                            }));
                            return;
                          }
                          setForm((prev) => ({
                            ...prev,
                            permissions: prev.permissions.filter(
                              (p) => p.id != permission.id
                            ),
                          }));
                        }}
                      >
                        <div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly={true}
                            className="h-8 flex items-center"
                          ></input>
                        </div>
                        <div className="text-sm flex items-center">
                          {permission.name}
                        </div>
                        <div className="text-sm flex items-center">
                          {permission.description}
                        </div>
                      </li>
                      <Divider />
                    </React.Fragment>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <PrimaryButton disabled={isCreateButtonDisabled}>
              Update Role
            </PrimaryButton>
            <LightOutlineButton
              type="button"
              onClick={() => {
                closeModal();
              }}
            >
              Cancel
            </LightOutlineButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};
export default EditRoleModal;
