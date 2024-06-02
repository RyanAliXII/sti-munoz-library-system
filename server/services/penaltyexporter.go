package services

import (
	"bytes"

	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gocarina/gocsv"
	"github.com/xuri/excelize/v2"
)
var penaltyHeaderColumns = []string{
		"reference_number",
		"name",
		"student_number",
		"program_code",
		"user_type",
		"description",
		"amount",
		"item",
		"remarks",
		"created_at",
		"is_settled",
}
type PenaltyExport struct {}
type PenaltyExporter interface{
	ExportCSV(data []model.PenaltyExport)(*bytes.Buffer, error)
	ExportExcel(data []map[string]interface{})(*bytes.Buffer, error)
}
func(s * PenaltyExport)ExportCSV(data []model.PenaltyExport)(*bytes.Buffer, error){
	buffer := new(bytes.Buffer)
	bytes, err := gocsv.MarshalBytes(&data)
	if err != nil {
		return buffer, err
	}
	_, err = buffer.Write(bytes)
	if err != nil {
		return buffer, err
	}
	return buffer, nil
}
func(s * PenaltyExport)ExportExcel(data []map[string]interface{})(*bytes.Buffer, error){
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
	err := buildExcelHeaders(f, penaltyHeaderColumns, firstSheet)
	if err != nil {
		return buffer, err
	}
	const SECOND_ROW = 2
	err = buildExcelData(f, data, penaltyHeaderColumns, firstSheet, SECOND_ROW)
	if err != nil {
		return buffer, err
	}
	err = f.Write(buffer)
	if err != nil {
		return buffer, err
	}
	return buffer, nil
}
func NewPenaltyExporter() PenaltyExporter{
	return &PenaltyExport{}
}