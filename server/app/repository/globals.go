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
)

var (
	GET_AUTHOR       = FORMAT_FUNC(AUTHOR_REPO, "Get")
	NEW_AUTHOR       = FORMAT_FUNC(AUTHOR_REPO, "New")
	DELETE_AUTHOR    = FORMAT_FUNC(AUTHOR_REPO, "Delete")
	UPDATE_AUTHOR    = FORMAT_FUNC(AUTHOR_REPO, "Update")
	GET_PUBLISHER    = FORMAT_FUNC(PUBLISHER_REPO, "Get")
	NEW_PUBLISHER    = FORMAT_FUNC(PUBLISHER_REPO, "New")
	DELETE_PUBLISHER = FORMAT_FUNC(PUBLISHER_REPO, "Delete")
	UPDATE_PUBLISHER = FORMAT_FUNC(PUBLISHER_REPO, "Update")
)

func FORMAT_FUNC(repo string, function string) string {
	return fmt.Sprintf("%s.%s", repo, function)
}
