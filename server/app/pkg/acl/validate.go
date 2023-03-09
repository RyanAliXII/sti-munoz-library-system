package acl

func Validate(permissions map[string][]string) map[string][]string {
	// removes permissions that are not defined in this app
	//very important when updating a certain role and there is a changes in definitions of roles.
	validatedPermissions := map[string][]string{}
	for key, value := range permissions {
		for _, p := range value {
			_, isPermissionExist := PermissionsFlatMap[p]
			if !isPermissionExist {
				continue
			}

			validatedPermissions[key] = append(validatedPermissions[key], p)
				
		}
	}
	return validatedPermissions

}
