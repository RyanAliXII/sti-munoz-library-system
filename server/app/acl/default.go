package acl

import (
	"fmt"
	"strings"
)





func BuildRootPermissions ()(string){
	var permissionStr strings.Builder
	for idx, module := range Modules{
		if(idx + 1 == len(Modules)){
			permissionStr.WriteString(module.Value)
		}else{
			permissionStr.WriteString(fmt.Sprintf("%s ", module.Value))
		}
		
	}
	return permissionStr.String()
}