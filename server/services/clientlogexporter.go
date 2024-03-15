package services

import (
	"bytes"
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/numtochar"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gocarina/gocsv"
	"github.com/xuri/excelize/v2"
)

type ClientLogExporter interface{
	ExportCSV([]model.ClientLogExport) (*bytes.Buffer, error)
	ExportExcel([]map[string]interface{})(*bytes.Buffer, error)
}

type ClientLogExport struct {}
var excelHeaderColumns = []string{
	"patron",
	"student_number",
	"user_type",
	"program_code",
	"created_at",
}
func (s * ClientLogExport)ExportCSV(logs []model.ClientLogExport)(*bytes.Buffer, error) {
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
func(s * ClientLogExport)ExportExcel(logs []map[string]interface{})(*bytes.Buffer, error){
	buffer := new(bytes.Buffer)
	f := excelize.NewFile();
	if(len(logs) == 0){
		f.Write(buffer)
		return buffer, nil
	}
	if (len(f.GetSheetList()) == 0){
		return buffer, nil
	}
	firstSheet := f.GetSheetList()[0]
	for rowCursor, log := range logs{
		for colCursor, col := range excelHeaderColumns {
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
func NewClienLogExporter() ClientLogExporter{
	return &ClientLogExport{}
}