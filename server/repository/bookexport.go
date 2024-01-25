package repository

import (
	"bytes"
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gocarina/gocsv"
	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"
)

var excelHeaderColumns = []string{
	"book_id",
	"accession_id",
	"accession_number",
	"copy_number",
	"title",
	"subject",
	"description",
	"isbn",
	"pages",
	"cost_price",
	"edition",
	"year_published",
	"received_at",
	"ddc",
	"author_number",
	// "author",
	// "ebook",
}
var alphabet = []string{"A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"}
func toChar(i int) string {
    return alphabet[i-1]
}
var excelSheet = "Books"

func(repo * BookRepository)ExportBooks(collectionId int, fileType string)(*bytes.Buffer, error) {
	buffer := new(bytes.Buffer)
	if(fileType == ".xlsx"){
		file, err := repo.processExcel(collectionId)
		if err != nil {
			return buffer, err
		}
		 err = file.Write(buffer)
		if err != nil {
			return buffer, err
		}
		return buffer, nil
	}
	if(fileType == ".csv"){
		csvBuffer, err := repo.processCSV(collectionId)
		if err != nil {
			return buffer, err
		}
		return csvBuffer, nil
	}
	return buffer, fmt.Errorf("unsupported file type: %s", fileType)
}

func(repo * BookRepository)processExcel(collectionId int) (*excelize.File, error) {
	f := excelize.NewFile()
	accessions, err := repo.getExcelDataByCollectionId(collectionId)
	if err != nil {
		return f, err
	}
	if(len(accessions) == 0){
		return f, nil
	}
    defer func() {
        if err := f.Close(); err != nil {
			logger.Error(err.Error(), slimlog.Error("error while closing excel file"))
        }
    }()
	sheetIdx, err := f.NewSheet(excelSheet)
	if err != nil {
		return f,err
	}
	err = repo.buildExcelHeaders(f)
	if err != nil {
		return f,err
	}
	
	err = repo.addExcelData(2, accessions, f)
	if err != nil {
		return f,err
	}
	f.SetActiveSheet(sheetIdx)
	
	
	return f, err
}
func(repo * BookRepository)addExcelData(startingRow int, accessions []map[string]interface{}, f * excelize.File) error {
	for rowCursor, accession := range accessions {
		for colCursor, col  := range excelHeaderColumns{
			char := toChar(colCursor + 1)
			cell := fmt.Sprintf("%s%d", char, rowCursor + startingRow)
			err  := f.SetCellValue(excelSheet, cell, accession[col])
			
			if err != nil {
				return err
			}
		}
	}
	return nil
}
func( repo *  BookRepository)buildExcelHeaders(f * excelize.File) error {
	for idx, col := range excelHeaderColumns {
		char := toChar(idx + 1)
		cell := fmt.Sprintf(`%s1`, char)
		err := f.SetCellValue(excelSheet, cell, col)
		if err != nil {
			return err
		}
	}
	return nil
}

func(repo * BookRepository)getExcelDataByCollectionId(collectionId int)([]map[string]interface{}, error) {
	results := []map[string]interface{}{}
    query := `
	SELECT  accession.number as accession_number, copy_number, book.title, 
	book.id as book_id,
	accession.id as accession_id,
	book.subject,
	description,
	isbn,
	pages,
	cost_price,
	edition,
	COALESCE(year_published, 0),
	received_at,
	ddc,
	author_number,
	ebook
	FROM catalog.accession
	INNER JOIN book_view as book on accession.book_id = book.id 
	where book.section_id = $1
	ORDER BY accession_number ASC
	`
	rows, err := repo.db.Queryx(query, collectionId)
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
		if idBytes, ok := result["accession_id"].([]byte); ok {
			id, err := uuid.FromBytes(idBytes[:16])
			if err != nil {
				return  results, err
			}
			result["accession_id"] = id.String()
		}
		if idBytes, ok := result["book_id"].([]byte); ok {
			id, err := uuid.FromBytes(idBytes[:16])
			if err != nil {
				return results, err
			}
			result["book_id"] = id.String()
		}
		
		results = append(results, result)
	}
	
	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		return results, err
	}

	return results, nil
}


func (repo * BookRepository)processCSV(collectionId int) (*bytes.Buffer, error) {
	buffer := new(bytes.Buffer)
	accessions, err := repo.getCSVDataByCollectionId(collectionId)
	if err != nil {
		return buffer,err
	}
	bytes, err := gocsv.MarshalBytes(&accessions)
	if err != nil {
		return buffer, err
	}
	_, err = buffer.Write(bytes)
	if err != nil {
		return buffer, err
	}
	return buffer, nil
}

func (repo * BookRepository)getCSVDataByCollectionId(collectionId int)([]model.BookExport, error) {
	accessions := make([]model.BookExport, 0)
	query := `
	SELECT  accession.number as accession_number, copy_number, book.title, 
	book.id as book_id,
	accession.id as accession_id,
	book.subject,
	description,
	isbn,
	pages,
	cost_price,
	edition,
	COALESCE(year_published, 0) as year_published,
	ddc,
	author_number,
	ebook
	FROM catalog.accession
	INNER JOIN book_view as book on accession.book_id = book.id 
	where book.section_id = $1
	ORDER BY accession_number ASC
	`
	err := repo.db.Select(&accessions, query, collectionId)
	return accessions, err

}

