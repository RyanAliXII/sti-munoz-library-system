package acl

import (
	"fmt"
	"strings"
)





func BuildRootPermissions ()(string){
	var permissionStr strings.Builder
	for _, module := range Modules{
		permissionStr.WriteString(fmt.Sprintf("%s ", module.Value))
	}
	return permissionStr.String()
}