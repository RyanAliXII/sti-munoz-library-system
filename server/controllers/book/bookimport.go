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
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/applog"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/RyanAliXII/sti-munoz-library-system/server/repository"
	"github.com/gin-gonic/gin"
	"github.com/gocarina/gocsv"
)

func(ctrler *Book) validateHeaders(file multipart.File) error {
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
func (ctrler *Book) ImportBooks(ctx * gin.Context) {
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
		ctrler.services.Logger.Error(fileErr.Error(), applog.Function("BookController.ImportBooks"), applog.Error("fileErr"))
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
		ctrler.services.Logger.Error(err.Error(), applog.Error("seekErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured."))
		return
	}
	booksImports := make([]model.BookImport, 0)
	bytesFile, toBytesErr := io.ReadAll(file)

	if toBytesErr != nil {
		ctrler.services.Logger.Error(toBytesErr.Error(), applog.Function("BookController.ImportBook"), applog.Error("toBytesErr"))
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
		ctrler.services.Logger.Error(parseErr.Error(), applog.Function("BookController.ImportBook"), applog.Error("parseErr"))
		ctx.JSON(httpresp.Fail400(nil, "Unknown error occured."))
		return
	}
	err = ctrler.services.Repos.BookRepository.ImportBooks(booksImports, parsedSectionId)
	if err != nil {
		_, isDuplicateErr := err.(*repository.DuplicateError)
		if isDuplicateErr {
			ctx.JSON(httpresp.Fail400(gin.H{
				"errors": gin.H{
					"row": 0,
					"column":0,
					"message": err.Error(),
				},
				
			}, "Duplicate error"))
			return 
		}
		ctrler.services.Logger.Error(err.Error(), applog.Error("ImportBooksErr"))
		ctx.JSON(httpresp.Fail500(nil, "Unknown error occured"))
		return
	}
	ctrler.services.Repos.RecordMetadataRepository.InvalidateBook()
	ctrler.services.Repos.RecordMetadataRepository.InvalidateAccession()	
	
}
