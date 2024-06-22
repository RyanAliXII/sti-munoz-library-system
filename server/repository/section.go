package repository

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"

	"github.com/jmoiron/sqlx"
)

type Section struct {
	db *sqlx.DB
}

func (repo *Section) New(section model.Section) error {
	if section.MainCollectionId == 0 {
		_, insertErr := repo.db.Exec("INSERT INTO catalog.section(name, prefix, is_non_circulating)VALUES($1, $2, $3)", section.Name, section.Prefix, section.IsNonCirculating)
		if insertErr != nil {
			
			logger.Error(insertErr.Error(), slimlog.Function("Section.New"))
			return insertErr
		}
	}else{
		_, insertErr := repo.db.Exec("INSERT INTO catalog.section(name, prefix, is_non_circulating, main_collection_id)VALUES($1, $2, $3, $4)", section.Name, section.Prefix, 
		section.IsNonCirculating, section.MainCollectionId)
		if insertErr != nil {
		
			logger.Error(insertErr.Error(), slimlog.Function("Section.New"))
			return insertErr
		}
	}
	return nil
}
func (repo * Section)Update(section model.Section) error {
	_, err  := repo.db.Exec("UPDATE catalog.section set name= $1, prefix = $2, is_non_circulating = $3 where id = $4", section.Name, section.Prefix, section.IsNonCirculating, section.Id)
	if err != nil {
		return err
	}
	return nil;
}
func (repo *Section) Get() []model.Section {
	var sections []model.Section = make([]model.Section, 0)
	selectErr := repo.db.Select(&sections, `
	SELECT section.id, 
	name,
	prefix,
	is_non_circulating,
	(case when main_collection_id is null then 0 else main_collection_id end) as main_collection_id,
	(case when (count(book.id) > 0) OR (count_children_of_collection(section.id) > 0) then false else true end) is_deleteable,
	(case when main_collection_id is null then false else true end) 
	as is_sub_collection from catalog.section 
	LEFT join catalog.book on section.id = book.section_id 
	where section.deleted_at is null
	GROUP BY section.id ORDER BY section.name ASC`)
	if selectErr != nil {
		logger.Error(selectErr.Error(), slimlog.Function("Section.Get"))
	}
	return sections
}

func (repo *Section)GetById(id int)(model.Section, error)  {
	section := model.Section{}
	err := repo.db.Get(&section,`
	SELECT section.id, 
	name,
	prefix,
	is_non_circulating,
	(case when (count(book.id) > 0) OR (count_children_of_collection(section.id) > 0) then false else true end) is_deleteable,
	(case when main_collection_id is null then false else true end) 
	as is_sub_collection from catalog.section 
	LEFT join catalog.book on section.id = book.section_id 
	where section.deleted_at is null and section.id = $1
	GROUP BY section.id ORDER BY section.created_at DESC LIMIT 1`, id)
	
	return section, err
}


func (repo * Section)Delete(id int) error {
	section, err := repo.GetById(id)
	if err != nil{
		return err
	}
	if(!section.IsDeletable){
		return fmt.Errorf("collection is not deleteable")
	}
	_, err = repo.db.Exec("UPDATE catalog.section set deleted_at = NOW() where id = $1", id)
	return err
}
func(repo * Section)GetCollectionTree()[]*model.Tree[int, model.Section] {
	collections := repo.Get();
	tree := repo.TransformToTree(collections)
	return tree
}
func (repo * Section)TransformToTree(collections []model.Section)[]*model.Tree[int, model.Section]{
	tree := make([]*model.Tree[int, model.Section], 0)
	nodeCache := make(map[int]*model.Tree[int, model.Section])
	for _, collection := range collections {
		if(collection.MainCollectionId == 0){ // if mainCollectionId is 0, it means a node is a root node
			node := repo.findThenUpdateOrCreateNode(nodeCache, collection.Id, collection)
			tree = append(tree, node)
			nodeCache[collection.Id] = node 
			continue
		}
		parentNode := repo.findThenUpdateOrCreateNode(nodeCache, collection.MainCollectionId, collection)
		childNode := repo.findThenUpdateOrCreateNode(nodeCache, collection.Id, collection)
		parentNode.Children = append(parentNode.Children, childNode)
		nodeCache[collection.MainCollectionId]  = parentNode
		nodeCache[collection.Id] = childNode
	}
	return tree
}
func (repo *Section)findThenUpdateOrCreateNode(cache map[int]*model.Tree[int, model.Section],
	nodeId int , collection  model.Section) *model.Tree[int, model.Section] {
	node, isInCache := cache[nodeId]
	if isInCache {
		if(nodeId == collection.Id){
			node.Id = collection.Id
			node.Name = collection.Name
			node.Data = collection
		}
		return node
	}
	return &model.Tree[int, model.Section]{
		Id: nodeId,
		Name: collection.Name,
		Children: make([]*model.Tree[int, model.Section], 0),
		Data: collection,
	}
}
func NewSectionRepository(db * sqlx.DB) SectionRepository {
	return &Section{
		db: db,
	}
}
type SectionRepository interface {
	New(section model.Section) error
	Get() []model.Section
	Update(section model.Section) error
	GetById(id int)(model.Section, error)
	Delete(id int) error
	GetCollectionTree() []*model.Tree[int,model.Section]
	TransformToTree(collections []model.Section)[]*model.Tree[int, model.Section]
}
