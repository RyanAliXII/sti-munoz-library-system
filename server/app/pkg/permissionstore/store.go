package permissionstore

import (
	"sync"
)


type PermissionStore interface {
	HasPermission(string, []string) bool
	Invalidate()
}

var postgresstore PermissionStore;
var once sync.Once

func GetPermissionStore() PermissionStore{
	once.Do(func(){
		postgresstore = NewPostgresPermissionStore()
	})
	return postgresstore
}




