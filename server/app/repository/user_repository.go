package repository

import (
	"fmt"
	"ryanali12/web_service/app/models"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/mysql"
	"github.com/jmoiron/sqlx"
)

type userRepository struct {
	db *sqlx.DB
}

func (repo userRepository) CreateUser(user models.User) {
	insertQuery, _, _ := goqu.Dialect("mysql").Insert("users").Cols("firstname", "lastname", "email", "password").Vals(
		goqu.Vals{user.Firstname, user.Lastname, user.Email, user.Password},
	).ToSQL()
	// if prepErr != nil {
	// 	panic(prepErr.Error())
	// }
	fmt.Println(insertQuery)
	_, err := repo.db.Exec(insertQuery)
	if err != nil {
		fmt.Print(err.Error())
	}
	fmt.Println("EXECUTED")
	// stmt.Exec(user.Firstname, user.Lastname, user.Email, user.Password)
}

type UserRepository interface {
	CreateUser(models.User)
}
