package services

import (
	"bytes"
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/numtochar"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gocarina/gocsv"
	"github.com/xuri/excelize/v2"
)

type BorrowedBookExporter interface{
	ExportCSV([]model.BorrowedBookExport) (*bytes.Buffer, error)
	ExportExcel([]map[string]interface{})(*bytes.Buffer, error)
}

type BorrowedBookExport struct {}
var borrowedBookExcelHeaders = []string{
	"book",
	"copy_number",
	"accession_number",
	"is_ebook",
	"patron",
	"email",
	"user_type",
	"program_code",
	"due_date",
	"status",
	"penalty",
}
func (s * BorrowedBookExport)ExportCSV(logs []model.BorrowedBookExport)(*bytes.Buffer, error) {
	buffer := new(bytes.Buffer)
	bytes, err := gocsv.MarshalBytes(&logs)
	if err != nil {
		return buffer, err
	}
	_, err = buffer.Write(bytes)
	if err != nil {
		return buffer, err
	}
	return buffer, nil
}
func(s * BorrowedBookExport)ExportExcel(data []map[string]interface{})(*bytes.Buffer, error){
	buffer := new(bytes.Buffer)
	f := excelize.NewFile();
	if(len(data) == 0){
		f.Write(buffer)
		return buffer, nil
	}
	if (len(f.GetSheetList()) == 0){
		return buffer, nil
	}
	firstSheet := f.GetSheetList()[0]
	for rowCursor, log := range data{
		for colCursor, col := range borrowedBookExcelHeaders  {
			char := numtochar.ToChar(colCursor + 1)
			cell := fmt.Sprintf("%s%d", char, rowCursor + 1)
			err := f.SetCellValue(firstSheet, cell, log[col])
			if err != nil {
				return buffer, err
			}
		}
	}
	err := f.Write(buffer)
	if err != nil {
		return buffer, err
	}
	return buffer, nil
}
func NewBorrowedBookExporter() BorrowedBookExporter{
	return &BorrowedBookExport{}
}