package services

import (
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/numtochar"
	"github.com/xuri/excelize/v2"
)
func buildExcelHeaders(f * excelize.File, headers []string, excelSheet string) error {
	for idx, col := range headers {
		char := numtochar.ToChar(idx + 1)
		cell := fmt.Sprintf(`%s1`, char)
		err := f.SetCellValue(excelSheet, cell, col)
		if err != nil {
			return err
		}
	}
	return nil
}
func buildExcelData(f * excelize.File, excelData []map[string]interface{} , headers []string, excelSheet string, rowCursorStart uint) error {
	for rowCursor, data := range excelData{
		for colCursor, col := range headers {
			char := numtochar.ToChar(colCursor + 1)
			cell := fmt.Sprintf("%s%d", char, rowCursor + int(rowCursorStart))
			err := f.SetCellValue(excelSheet, cell, data[col])
			if err != nil {
				return err
			}
		}
	}
	return nil
}

