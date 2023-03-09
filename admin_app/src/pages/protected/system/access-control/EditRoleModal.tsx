import {
  LightOutlineButton,
  PrimaryButton,
} from "@components/ui/button/Button";
import Divider from "@components/ui/divider/Divider";
import { Input } from "@components/ui/form/Input";
import { EditModalProps, ModalProps, Module, Role } from "@definitions/types";
import { ErrorMsg } from "@definitions/var";
import { useForm } from "@hooks/useForm";
import { useRequest } from "@hooks/useRequest";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import React, { BaseSyntheticEvent, useEffect, useMemo, useRef } from "react";
import Modal from "react-responsive-modal";
import { toast } from "react-toastify";
import { RoleSchemaValidation } from "../schema";

const EditRoleModal = ({
  closeModal,
  isOpen,
  formData,
}: EditModalProps<Role>) => {
  const { Get, Put } = useRequest();
  const modalRef = useRef<HTMLElement | null>(null);
  const {
    form,
    handleFormInput,
    setForm,
    validate,
    errors,
    registerFormGroup,
  } = useForm<Role>({
    initialFormData: {
      name: "",
      permissions: {},
    },
    schema: RoleSchemaValidation,
    parentElementScroll: modalRef,
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
  const queryClient = useQueryClient();
  const fetchModules = async () => {
    try {
      const { data: response } = await Get("/system/modules");
      return response?.data?.modules ?? [];
    } catch (error) {
      console.log(error);
      return [];
    }
  };
  const updateRole = useMutation({
    mutationFn: (role: Role) => Put(`/system/roles/${formData.id}`, role),
    onSuccess: () => {
      toast.success("Role has been updated Successfully");
      queryClient.invalidateQueries(["roles"]);
    },
    onError: () => {
      toast.error(ErrorMsg.Update);
    },
    onSettled: () => {
      closeModal();
    },
  });

  const { data: modules } = useQuery<Module[]>({
    queryKey: ["modules"],
    queryFn: fetchModules,
  });

  const selectedPermissionCache: Record<string, Object> = useMemo(
    () =>
      Object.keys(form.permissions).reduce<Record<string, Object>>(
        (prev, key) => {
          const permissionObj = form.permissions[key].reduce<Object>(
            (a, permission) => ({ ...a, [permission]: true }),
            {}
          );
          return { ...prev, [key]: permissionObj };
        },
        {}
      ),
    [form.permissions]
  );

  const handleSelect = (module: string, permission: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      permissions: {
        ...prevForm.permissions,
        [module]: [...(prevForm.permissions[module] ?? []), permission],
      },
    }));
  };
  const handleRemove = (module: string, permission: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      permissions: {
        ...prevForm.permissions,
        [module]: prevForm.permissions[module].filter((p) => p != permission),
      },
    }));
  };

  if (!isOpen) return null;
  return (
    <Modal
      center
      onClose={closeModal}
      open={isOpen}
      showCloseIcon={false}
      styles={{
        modal: {
          maxHeight: "500px",
        },
      }}
      classNames={{ modal: "w-11/12 md:w-1/3 lg:w-11/12 rounded" }}
    >
      <form onSubmit={submit}>
        <div className="w-full mt-2">
          <div className="px-2 mb-3">
            <h1 className="text-xl font-semibold">Edit role</h1>
          </div>
          <Input
            ref={registerFormGroup("name")}
            type="text"
            name="name"
            onChange={handleFormInput}
            value={form.name}
            label="Role name"
            placeholder="e.g Librarian, Assistant Librarian, Staff"
            error={errors?.name}
          ></Input>

          <div>
            <h2 className="text-lg py-2 font-semibold ml-1 mt-4">
              Role Access Level
            </h2>
            {modules?.map((module) => {
              return (
                <div key={module.name} className="px-2">
                  <div className="py-2">{module.displayText}</div>
                  <Divider></Divider>
                  <ul className="list-none px-1 ">
                    {module.permissions.map((p) => {
                      let isChecked = false;
                      const selectedModule = selectedPermissionCache[
                        module.name
                      ] as Record<string, boolean>;
                      if (selectedModule) {
                        isChecked = selectedModule[p.name];
                      }

                      return (
                        <React.Fragment key={p.name}>
                          <li
                            className="grid grid-cols-3 px-1 py-1 cursor-pointer"
                            onClick={() => {
                              if (isChecked) {
                                handleRemove(module.name, p.name);
                                return;
                              }
                              handleSelect(module.name, p.name);
                            }}
                          >
                            <div>
                              <input
                                type="checkbox"
                                checked={isChecked ? true : false}
                                readOnly={true}
                                className="h-8 flex items-center"
                              ></input>
                            </div>
                            <div className="text-sm flex items-center">
                              {p.name}
                            </div>
                            <div className="text-sm flex items-center">
                              {p.description}
                            </div>
                          </li>
                          <Divider />
                        </React.Fragment>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 mt-5">
            <PrimaryButton>Update role</PrimaryButton>
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
