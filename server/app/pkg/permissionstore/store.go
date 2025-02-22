package permissionstore

import (
	"sync"
)


type PermissionStore interface {
	HasPermission(string, []string) bool
	Invalidate()
}

var store PermissionStore;
var once sync.Once

func New(storeImpl  PermissionStore) PermissionStore{
	once.Do(func(){
		store = storeImpl
	})
	return store
}




