package permissionstore

import (
	"fmt"
	"slices"
	"time"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/jmoiron/sqlx"
)
type PostgresPermissionCache struct {
	Permissions []string
	ValidUntil  time.Time
}
type PostgresPermissionStore struct {
	db    *sqlx.DB
	store map[string]PostgresPermissionCache
}
func NewPostgresPermissionStore() PermissionStore{
	return &PostgresPermissionStore{
		db: db.Connect(),
		store: make(map[string]PostgresPermissionCache),
	}
}
func (s *PostgresPermissionStore) HasPermission(accountId string, permissions []string) bool {
	cache, isInCache := s.store[accountId]
	if !isInCache || time.Now().After(cache.ValidUntil) {
		
		cache = PostgresPermissionCache{
			Permissions: []string{},
			ValidUntil:  time.Now().Add(time.Minute * 15),
		}
		query := `
			SELECT system.role_permission.value
			FROM system.account_role
			INNER JOIN account_view AS account ON account_role.account_id = account.id
			INNER JOIN system.role ON account_role.role_id = role.id
			INNER JOIN system.role_permission ON role.id = role_permission.role_id 
			WHERE account.id = $1
		`
		err := s.db.Select(&cache.Permissions, query, accountId)
		if err != nil {
			fmt.Println(err.Error())
		}
		s.store[accountId] = cache
	}
	for _, permission := range permissions {
		hasPermission := slices.Contains(cache.Permissions, permission)
		if hasPermission {
			return true
		}
	}

	return false
}
func(s * PostgresPermissionStore)Invalidate(){
	for key := range s.store {
		s.store[key] = PostgresPermissionCache{
			Permissions: []string{},
			ValidUntil: time.Now(),
		}
	}
}