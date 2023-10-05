package filter

import (
	"strconv"
	"strings"
	"unicode"

	"github.com/gin-gonic/gin"
)

type Filter struct {
	Offset   int
	Limit    int
	Keyword  string
	Page int
}


var defaultFilter  = Filter{
	Limit: 30, // default number of rows to fetch per page
	Keyword: "", // search keyword
	Page: 1, // default page number
} 	

func ExtractFilter(ctx * gin.Context ) Filter {
	filter := defaultFilter
	page := ctx.Query("page")
	parsedPage, parsePageErr := strconv.Atoi(page)
	if parsePageErr == nil {
		filter.Page = parsedPage
		if parsedPage <= 0 {
			filter.Page = 1
		}
	}
	filter.Offset = (filter.Page - 1) * filter.Limit
	keyword := strings.Map(func(r rune) rune {
		if unicode.IsSpace(r){
			return  -1
		}
		return r
	}, ctx.Query("keyword") )
	filter.Keyword = keyword
	return filter
}

func(filter * Filter) ExtractFilter(ctx *gin.Context){
	page := ctx.Query("page")
	parsedPage, parsePageErr := strconv.Atoi(page)
	if parsePageErr == nil {
		filter.Page = parsedPage
		if parsedPage <= 0 {
			filter.Page = 1
		}
	}
	filter.Offset = (filter.Page - 1) * filter.Limit
	keyword := strings.Map(func(r rune) rune {
		if unicode.IsSpace(r){
			return  -1
		}
		return r
	}, ctx.Query("keyword") )
	filter.Keyword =  keyword
}










