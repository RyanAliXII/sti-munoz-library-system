package permissionstore

import (
	"fmt"
	"sync"
	"time"

	"github.com/jmoiron/sqlx"
)

type PostgresPermissionCache struct {
    Permissions []string
    ValidUntil  time.Time
}

type PostgresPermissionStore struct {
    db    *sqlx.DB
    store map[string]PostgresPermissionCache
    mu    sync.RWMutex // Mutex for thread-safe map access
}

func NewPostgresPermissionStore(db *sqlx.DB) *PostgresPermissionStore {
    return &PostgresPermissionStore{
        db:    db,
        store: make(map[string]PostgresPermissionCache),
    }
}

func (s *PostgresPermissionStore) HasPermission(accountId string, permissions []string) bool {
    // Read lock (multiple readers allowed)
    s.mu.RLock()
    cache, isInCache := s.store[accountId]
    s.mu.RUnlock()

    // If cache is expired or not found, refresh it
    if !isInCache || time.Now().After(cache.ValidUntil) {
        s.mu.Lock() // Exclusive write lock
        if !isInCache || time.Now().After(cache.ValidUntil) { // Re-check to avoid duplicate DB calls
            cache = PostgresPermissionCache{
                Permissions: []string{},
                ValidUntil:  time.Now().Add(15 * time.Minute),
            }

            query := `
                SELECT system.role_permission.value 
                FROM system.account_role 
                INNER JOIN system.role ON account_role.role_id = role.id
                INNER JOIN system.role_permission ON role.id = role_permission.role_id
                WHERE account_role.account_id = $1
            `

            err := s.db.Select(&cache.Permissions, query, accountId)
            if err != nil {
                s.mu.Unlock()
                fmt.Printf("Error fetching permissions for account %s: %v\n", accountId, err)
                return false
            }

            s.store[accountId] = cache // Update cache safely
        }
        s.mu.Unlock()
    }

    // Optimized permission checking using a map
    permMap := make(map[string]struct{}, len(cache.Permissions))
    for _, perm := range cache.Permissions {
        permMap[perm] = struct{}{}
    }

    for _, permission := range permissions {
        if _, exists := permMap[permission]; exists {
            return true
        }
    }

    return false
}

func (s *PostgresPermissionStore) Invalidate() {
    s.mu.Lock()
    defer s.mu.Unlock()
    s.store = make(map[string]PostgresPermissionCache) // Reset cache safely
}
