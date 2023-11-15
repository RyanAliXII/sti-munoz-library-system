package filter

import (
	"fmt"
	"strconv"

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
	filter.Keyword = ctx.Query("keyword")
	return filter
}

func(filter * Filter) ExtractFilter(ctx *gin.Context){
    filter.Offset = defaultFilter.Offset
	filter.Page = defaultFilter.Page
	filter.Limit = defaultFilter.Limit
	page := ctx.Query("page")
	parsedPage, parsePageErr := strconv.Atoi(page)
	if parsePageErr == nil {
		filter.Page = parsedPage
		if parsedPage <= 0 {
			filter.Page = 1
		}
	}
	fmt.Println()
	filter.Offset = (filter.Page - 1) * filter.Limit
	filter.Keyword =  ctx.Query("keyword")
}










