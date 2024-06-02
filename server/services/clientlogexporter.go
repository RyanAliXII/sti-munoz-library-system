package services

import (
	"bytes"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gocarina/gocsv"
	"github.com/xuri/excelize/v2"
)
var clientLogHeaders = []string{
	"patron",
	"student_number",
	"user_type",
	"program_code",
	"created_at",
}
type ClientLogExporter interface{
	ExportCSV([]model.ClientLogExport) (*bytes.Buffer, error)
	ExportExcel([]map[string]interface{})(*bytes.Buffer, error)
}
type ClientLogExport struct {}
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
	err := buildExcelHeaders(f, clientLogHeaders, firstSheet)
	if err != nil {
		return buffer, err
	} 
	const SECOND_ROW = 2
	err = buildExcelData(f, logs, clientLogHeaders, firstSheet, SECOND_ROW)
	if err != nil {
		return buffer, err
	}
	err = f.Write(buffer)
	if err != nil {
		return buffer, err
	}
	return buffer, nil
}
func NewClienLogExporter() ClientLogExporter{
	return &ClientLogExport{}
}