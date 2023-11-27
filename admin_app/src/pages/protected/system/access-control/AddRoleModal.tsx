import {
  LightOutlineButton,
  PrimaryButton,
} from "@components/ui/button/Button";
import Divider from "@components/ui/divider/Divider";
import { CustomInput, Input } from "@components/ui/form/Input";
import { ModalProps, Permission, Role } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import React, { BaseSyntheticEvent, Ref, useMemo, useRef } from "react";

import { toast } from "react-toastify";
import { RoleSchemaValidation } from "../schema";
import { Button, Checkbox, Modal } from "flowbite-react";

const AddRoleModal = ({ closeModal, isOpen }: ModalProps) => {
  const { Get, Post } = useRequest();
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

  const submit = async (event: BaseSyntheticEvent) => {
    event.preventDefault();
    try {
      const role = await validate();
      if (!role) return;
      createRole.mutate(role);
    } catch {}
  };

  const queryClient = useQueryClient();
  const fetchPermissions = async () => {
    try {
      const { data: response } = await Get("/system/modules", {});
      return response?.data?.permissions ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const createRole = useMutation({
    mutationFn: (role: Role) => Post("/system/roles", role, {}),
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

  return (
    <Modal onClose={closeModal} show={isOpen} size="4xl" dismissible>
      <Modal.Header>New Role</Modal.Header>
      <Modal.Body>
        <form onSubmit={submit}>
          <div>
            <CustomInput
              type="text"
              ref={registerFormGroup("name")}
              name="name"
              onChange={handleFormInput}
              value={form.name}
              label="Role name"
              error={errors?.name}
              placeholder="e.g Librarian, Assistant Librarian, Staff"
            ></CustomInput>

            <div>
              <h2 className="text-lg py-2 font-semibold ml-1 mt-4 text-gray-900 dark:text-gray-100">
                Role Access Level
              </h2>
              <div className="px-2">
                <ul className="list-none px-1 ">
                  {permissions?.map((permission) => {
                    const isChecked = selectedPermissions.has(permission.id);
                    return (
                      <React.Fragment key={permission.id}>
                        <li
                          className="grid grid-cols-3 px-1 py-1 cursor-pointer text-gray-600 items-center"
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
                            <Checkbox
                              checked={isChecked}
                              readOnly={true}
                              color="primary"
                            />
                          </div>
                          <div className="text-sm flex items-center">
                            {permission.name}
                          </div>
                          <div className="text-sm flex items-center">
                            {permission.description}
                          </div>
                        </li>
                        <div className="border-b dark:border-b-gray-700"></div>
                      </React.Fragment>
                    );
                  })}
                </ul>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <Button color="primary" type="submit">
                Save
              </Button>
              <Button
                color="light"
                type="button"
                onClick={() => {
                  closeModal();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};
export default AddRoleModal;
