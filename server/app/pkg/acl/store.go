package acl

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
)


type ApplicationPermissionStore struct{
	Client  map[string][]string
	Admin  map[string][]string
}
var store = map[string]ApplicationPermissionStore{}


func StorePermissions(accountId string, appId string ,permissions map[string][]string){
	
	if appId == azuread.AdminAppClientId{
		val, hasStored := store[accountId]
		if hasStored{
			store[accountId] = ApplicationPermissionStore{
				Admin: permissions,
				Client: val.Client,
			}
		}else{
			store[accountId] = ApplicationPermissionStore{
				Admin: permissions,
				Client: map[string][]string{},
			}
		}
		
	}


	if appId == azuread.ClientAppClientId{
		val, hasStored := store[accountId]
		if hasStored{
			store[accountId] = ApplicationPermissionStore{
				Client: permissions,
				Admin: val.Admin,
			}
		}else{
			store[accountId] = ApplicationPermissionStore{
				Client: permissions,
				Admin: map[string][]string{},
			}
		}
		
	}


	
}

func GetPermissionsByAccountIdAndAppId(accountId string, appId string)(map[string]bool,  error){
	accountPermissions, hasPermissions := store[accountId]
	accountPermissionsMap := map[string]bool{}
	if !hasPermissions {
		return  accountPermissionsMap ,fmt.Errorf("account permissions not found: %s", accountId )
	}
	if appId == azuread.AdminAppClientId{

	for _, permissions := range accountPermissions.Admin {
		for _, p := range permissions{
			accountPermissionsMap[p] = true
		}
	}
	return accountPermissionsMap, nil

	}

	if appId == azuread.ClientAppClientId{

		for _, permissions := range accountPermissions.Client {
			for _, p := range permissions{
				accountPermissionsMap[p] = true
			}
		}
		return accountPermissionsMap, nil
	
		}

	return nil, nil
}

// func toFlatMap(permissions map[string][]string)map[string]bool{
// 	accountPermissionsMap := map[string]bool{}
// 	for _, ps := range permissions {
// 		for _, p := range ps{
// 			accountPermissionsMap[p] = true
// 		}
// 	}
// 	return accountPermissionsMap
// }