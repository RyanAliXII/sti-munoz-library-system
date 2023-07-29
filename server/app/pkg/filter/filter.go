package filter

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

type Filter struct {
	Offset   int
	Limit    int
	Keyword  string
	FindBy   string
	SearchBy string
	Page int
}




func ExtractFilter(ctx * gin.Context) Filter {
	filter := Filter {}
	page := ctx.Query("page")
	parsedPage, parsePageErr := strconv.Atoi(page)
	if parsePageErr == nil {
		filter.Page = parsedPage
		if parsedPage <= 0 {
			filter.Page = 1
		}
	}
	filter.Keyword = ctx.Query("keyword")
	return filter
}










