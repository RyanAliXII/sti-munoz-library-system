package acl

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/azuread"
)


type ApplicationPermissionStore struct{
	Client  map[string] struct{}
	Admin  map[string] struct{}
}
var store = map[string]ApplicationPermissionStore{}


func StorePermissions(accountId string, appId string ,permissions map[string][]string){
	/*
		The roles and permissions has a structured so it is important to convert 
		it to flatmap before storing.

		example permission structure in json:
		`
			{
				"publisher": ["Publisher.ReadAll"],
				"author": ["Author.Add"],
			}
		`

		Maybe there is a better way but for now this work. 
	*/
	flattenPermissions := toFlatMap(permissions)


	/*
		The appId value originates from access token claim appid. 
		It is passed by middlewares.ValidateToken.
		It is important to know what application is the user using in order to separate the permissions for different apps.
		The value of app is the Client Id of application from Azure Active Directory.
	*/

	/*
		Check where does the request comes from and where to store permissions.
	*/
	if appId == azuread.AdminAppClientId{
		val, hasStored := store[accountId]
		if hasStored{
			store[accountId] = ApplicationPermissionStore{
				Admin: flattenPermissions,
				Client: val.Client,
			}
		}else{
			store[accountId] = ApplicationPermissionStore{
				Admin: flattenPermissions,
				Client: make(map[string]struct{}),
			}
		}
		
	}

	if appId == azuread.ClientAppClientId{
		val, hasStored := store[accountId]
		if hasStored{
			store[accountId] = ApplicationPermissionStore{
				Client: flattenPermissions,
				Admin: val.Admin,
			}
		}else{
			store[accountId] = ApplicationPermissionStore{
				Client: flattenPermissions,
				Admin: make(map[string]struct{}),
			}
		}
	
	}


	
}
func toFlatMap(permissions map[string][]string)map[string]struct{}{
	flatMap := make(map[string]struct{})
	for _, p := range permissions{
		for _, value := range p{
			flatMap[value] = struct{}{}
		}
	}
	return flatMap
}
func GetPermissionsByAccountIdAndAppId(accountId string, appId string)(map[string]struct{},  error){
	accountPermissions, hasPermissions := store[accountId]
	if !hasPermissions {
		return  make(map[string]struct{}) ,fmt.Errorf("account permissions not found: %s", accountId )
	}

	if appId == azuread.AdminAppClientId{
		return accountPermissions.Admin, nil

	}

	if appId == azuread.ClientAppClientId{
		return accountPermissions.Client, nil

	}


	return nil, fmt.Errorf("account permissions not found: %s", accountId )
}

