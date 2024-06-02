package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
)


func(repo * Borrowing) buildExportQuery(filter * BorrowingRequestFilter)(string, [] interface{}, error){
	dialect := goqu.Dialect("postgres")
	ds := dialect.Select(
		goqu.L("book->>'title'").As("book"),
		goqu.C("copy_number"),
		goqu.C("number").As("accession_number"),
		goqu.C("is_ebook"),
		goqu.L("CONCAT(client->>'givenName', ' ', client->>'surname')").As("patron"),
		goqu.L("client->>'email'").As("email"),
		goqu.L("client->>'userType'").As("user_type"),
		goqu.L("client->>'programCode'").As("program_code"),
		goqu.C("due_date"),
		goqu.C("status"),
		goqu.C("penalty"),
	).From(goqu.T("borrowed_book_all_view").As("bbv"))
	ds = repo.buildBorrowingRequestFilters(ds, filter)
	ds = repo.buildSortOrder(ds, filter)
	return ds.ToSQL()
}
func(repo * Borrowing)GetCSVData(filter * BorrowingRequestFilter)([]model.BorrowedBookExport, error){
	borrowedBooks := make([]model.BorrowedBookExport, 0)
	query, _ , err := repo.buildExportQuery(filter)
	if err != nil {
		return borrowedBooks, err
	}
	err = repo.db.Select(&borrowedBooks, query)
	if err != nil {
		return borrowedBooks, err
	}

	return borrowedBooks, nil
}


func(repo * Borrowing)GetExcelData(filter * BorrowingRequestFilter)([]map[string]interface{}, error){
	results := []map[string]interface{}{}
	query, args, err := repo.buildExportQuery(filter)
	if err != nil {
		return results, err
	}
	rows, err := repo.db.Queryx(query, args...)
	if err != nil {
		return results, err
	}
	defer rows.Close()

	for rows.Next() {
		// Create a map to store the result of each row
		result := make(map[string]interface{})

		// Use MapScan to map the columns to the map
		err := rows.MapScan(result)
		if err != nil {
			return results, err
		}
	
		results = append(results, result)
	}
	return results, err
}