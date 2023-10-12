package acl

import "fmt"






type PermissionsList []string

func (l  * PermissionsList) HasPermission(permission string) bool{
	
	for _, p := range *l{
		fmt.Println(p)
		fmt.Println(permission)
		fmt.Println(p == permission)
		if(permission == p){
			return true
		}
	}
	return false
}

func GetRootUserPermissions ()PermissionsList{
	list := PermissionsList{}
	for _, p := range Permissions{
		list = append(list, p.Value)
	}
	return list
}
