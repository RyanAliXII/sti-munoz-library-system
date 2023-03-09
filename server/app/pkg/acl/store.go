package acl

import "fmt"

var store = map[string]map[string][]string{}

func StorePermissions(accountId string, permissions map[string][]string){
	store[accountId] = permissions
}

func GetPermissionsByAccountId(accountId string)(map[string]bool,  error){
	accountPermissions, hasPermissions := store[accountId]
	accountPermissionsMap := map[string]bool{}
	if !hasPermissions {
		return  accountPermissionsMap ,fmt.Errorf("account permissions not found: %s", accountId )
	}
	for _, permissions := range accountPermissions {
		for _, p := range permissions{
			accountPermissionsMap[p] = true
		}
	}
	return accountPermissionsMap, nil
}
