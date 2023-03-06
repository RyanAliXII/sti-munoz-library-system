package acl

import (
	"errors"
	"fmt"
)

func Validate(permissions map[string][]string) error {
	for _, value := range permissions {
		for _, p := range value {
			_, isPermissionExist := PermissionsFlatMap[p]
			if !isPermissionExist {
				err := fmt.Errorf("permission does not exist on this app: %s", p)
				return errors.New(err.Error())
			}
		}
	}
	return nil
}
