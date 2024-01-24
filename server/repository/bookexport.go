package repository

import "github.com/RyanAliXII/sti-munoz-library-system/server/model"


func(repo * BookRepository)GetBooksByCollectionId(collectionId string)([]model.Accession, error) {
	accessions := make([]model.Accession, 0)
    query := `
	SELECT accession.id, accession.number, copy_number, book.json_format as book,
	accession.book_id,
	FROM catalog.accession
	INNER JOIN book_view as book on accession.book_id = book.id 
	where book.section_id = $1
	`
	err := repo.db.Select(&accessions, query)
	return accessions, err
}