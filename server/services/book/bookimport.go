package book

import (
	"bufio"
	"encoding/csv"
	"fmt"
	"io"
	"mime/multipart"
	"strconv"
	"strings"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/http/httpresp"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/slimlog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/gin-gonic/gin"
	"github.com/gocarina/gocsv"
)

func(ctrler * BookController) validateHeaders(file multipart.File) error {
	m, err := gocsv.CSVToMaps(bufio.NewReader(file))
	if err != nil {
		return err
	}
	requiredHeaders := map[string]struct{}{
		"accession_number": {},
		"author":{},
		"title": {},
		"publisher": {},
		"year_published": {},
	}

	for header := range m[0] {
		delete(requiredHeaders, header)		
	}
	var missingHeaders strings.Builder
	if len(requiredHeaders) != 0 {
		idx := 0
		for header := range requiredHeaders{
			if idx == 0 {
				missingHeaders.WriteString(header)
			}else{
				missingHeaders.WriteString(fmt.Sprintf(", %s", header))
			}
			idx++;
		}
		return fmt.Errorf("missing required headers: %s", missingHeaders.String())
	}
	return nil
	
}
func (ctrler * BookController) ImportBooks(ctx * gin.Context) {
	fileHeader, fileHeaderErr := ctx.FormFile("file")
	sectionId := ctx.PostForm("sectionId")
	parsedSectionId, err := strconv.Atoi(sectionId)
	if err != nil {
		ctx.JSON(httpresp.Fail400(nil, "Invalid sectionId"))
		return 
	}
	if fileHeaderErr != nil {
		ctx.JSON(httpresp.Fail400(nil, "No files uploaded."))
		return
	}
	file, fileErr := fileHeader.Open()

	if fileErr != nil {
		file.Close()
		logger.Error(fileErr.Error(), slimlog.Function("BookController.ImportBooks"), slimlog.Error("fileErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	defer file.Close()
	err = ctrler.validateHeaders(file)
	if err != nil {
		ctx.JSON(httpresp.Fail400(gin.H{
			"errors": gin.H{
				"row": 0,
				"column": 0,
				"message": err.Error(),
				
			},
		}, "Invalid CSV structure or format."))
		return
	}
	_, err = file.Seek(0,0)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("seekErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	booksImports := make([]model.BookImport, 0)
	bytesFile, toBytesErr := io.ReadAll(file)

	if toBytesErr != nil {
		logger.Error(toBytesErr.Error(), slimlog.Function("BookController.ImportBook"), slimlog.Error("toBytesErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	gocsv.SetCSVReader(func(in io.Reader) gocsv.CSVReader {
		return gocsv.LazyCSVReader(in)
	})
	parseErr := gocsv.UnmarshalBytes(bytesFile, &booksImports)

	if parseErr != nil {
		
		csvParseErr, isParseErr := parseErr.(*csv.ParseError);
		
		if isParseErr {
			message := "There's a problem with the value."
			numErr, isNumError := csvParseErr.Err.(*strconv.NumError)
			if isNumError  {
				message = fmt.Sprintf("Expected value is numerical. Given value: %s", numErr.Num)
			}
			ctx.JSON(httpresp.Fail400(gin.H{
				"errors": gin.H{
					"row": csvParseErr.Line,
					"column": csvParseErr.Column,
					"message": message,
					
				},
			}, "Invalid CSV structure or format."))
			return
		} 
		logger.Error(parseErr.Error(), slimlog.Function("BookController.ImportBook"), slimlog.Error("parseErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.bookRepository.ImportBooks(booksImports, parsedSectionId)
	if err != nil {
		logger.Error(err.Error(), slimlog.Error("ImportBooksErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	ctrler.recordMetadataRepo.InvalidateBook()
	ctrler.recordMetadataRepo.InvalidateAccession()	
	
}
