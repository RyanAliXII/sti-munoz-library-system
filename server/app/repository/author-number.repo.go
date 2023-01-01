package repository

import cutters "slim-app/server/app/pkg/cutters"

type AuthorNumberRepository struct {
	cutters *cutters.Cutters
}

func (repo *AuthorNumberRepository) Get() map[string]int {
	return repo.cutters.Default
}
func (repo *AuthorNumberRepository) GetGroupedArray() map[string][]map[string]interface{} {
	return repo.cutters.GroupedArray
}

func (repo *AuthorNumberRepository) GetGroupedObjects() map[string]map[string]int {
	return repo.cutters.GroupedObjects
}
func (repo *AuthorNumberRepository) GetDefaultArray() []map[string]interface{} {
	return repo.cutters.DefaultArray
}
func (repo *AuthorNumberRepository) GetByInitial(ch string) {

}
func (repo *AuthorNumberRepository) Generate(firstname string, lastname string) string {
	return repo.cutters.GenerateCutter(firstname, lastname)
}

func NewAuthorNumberRepository(cutters *cutters.Cutters) AuthorNumberRepositoryInterface {
	return &AuthorNumberRepository{
		cutters: cutters,
	}
}

type AuthorNumberRepositoryInterface interface {
	Get() map[string]int
	GetByInitial(ch string)
	Generate(firstname string, lastname string) string
	GetGroupedArray() map[string][]map[string]interface{}
	GetGroupedObjects() map[string]map[string]int
	GetDefaultArray() []map[string]interface{}
}
