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
)

func FORMAT_FUNC(repo string, function string) string {
	return fmt.Sprintf("%s.%s", repo, function)
}
