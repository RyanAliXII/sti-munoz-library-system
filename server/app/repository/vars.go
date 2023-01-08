package repository

import (
	"fmt"
	"slim-app/server/app/pkg/slimlog"

	"go.uber.org/zap"
)

// put all global declaration of vars in a packages
var logger *zap.Logger = slimlog.GetInstance()

const (
	SINGLE_RESULT = 1
)
const (
	AUTHOR_REPO    = "AuthorRepository"
	PUBLISHER_REPO = "PublisherRepository"
	SOF_REPO       = "SOFRepository"
	CATEGORY_REPO  = "CategoryRepository"
)

var (
	GET_AUTHORS      = FORMAT_FUNC(AUTHOR_REPO, "Get")
	NEW_AUTHOR       = FORMAT_FUNC(AUTHOR_REPO, "New")
	DELETE_AUTHOR    = FORMAT_FUNC(AUTHOR_REPO, "Delete")
	UPDATE_AUTHOR    = FORMAT_FUNC(AUTHOR_REPO, "Update")
	GET_PUBLISHERS   = FORMAT_FUNC(PUBLISHER_REPO, "Get")
	NEW_PUBLISHER    = FORMAT_FUNC(PUBLISHER_REPO, "New")
	DELETE_PUBLISHER = FORMAT_FUNC(PUBLISHER_REPO, "Delete")
	UPDATE_PUBLISHER = FORMAT_FUNC(PUBLISHER_REPO, "Update")
	GET_SOURCES      = FORMAT_FUNC(SOF_REPO, "Get")
	NEW_SOURCE       = FORMAT_FUNC(SOF_REPO, "New")
	DELETE_SOURCE    = FORMAT_FUNC(SOF_REPO, "Delete")
	UPDATE_SOURCE    = FORMAT_FUNC(SOF_REPO, "Update")
	GET_CATEGORY     = FORMAT_FUNC(CATEGORY_REPO, "Get")
	NEW_CATEGORY     = FORMAT_FUNC(CATEGORY_REPO, "New")
	UPDATE_CATEGORY  = FORMAT_FUNC(GET_CATEGORY, "Update")
	DELETE_CATEGORY  = FORMAT_FUNC(CATEGORY_REPO, "Delete")
)

func FORMAT_FUNC(repo string, function string) string {
	return fmt.Sprintf("%s.%s", repo, function)
}

type Filter struct {
	Offset  int
	Limit   int
	Keyword string
}
