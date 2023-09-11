package acl

import (
	"fmt"
	"strings"
)





func BuildRootPermissions ()(string){
	var permissionStr strings.Builder
	for idx, module := range Permissions{
		if(idx + 1 == len(Permissions)){
			permissionStr.WriteString(module.Value)
		}else{
			permissionStr.WriteString(fmt.Sprintf("%s ", module.Value))
		}
		
	}
	return permissionStr.String()
}