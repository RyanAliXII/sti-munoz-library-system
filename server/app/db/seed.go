package db

import (
	"fmt"
	"slim-app/server/app/pkg/cutters"
	"slim-app/server/app/pkg/dewey"
	"slim-app/server/app/pkg/slimlog"

	"github.com/doug-martin/goqu/v9"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

var logger = slimlog.GetInstance()

type DB struct {
	Connection *sqlx.DB
	Migration  Migration
}
type Migration struct {
	Dirty   bool
	Version uint
}

func RunSeed(db *sqlx.DB) {
	const FN = "db.SeedCuttersTable"
	driver, driverErr := postgres.WithInstance(db.DB, &postgres.Config{})
	if driverErr != nil {
		logger.Error(driverErr.Error(), slimlog.Function(FN), zap.String("error", "driverErr"))
		return
	}
	m, instanceErr := migrate.NewWithDatabaseInstance(
		"file://app/db/migrations",
		"postgres", driver)
	if instanceErr != nil {
		logger.Error(instanceErr.Error(), slimlog.Function(FN), zap.String("error", "instanceErr"))
		return
	}
	version, dirty, versionErr := m.Version()

	if versionErr != nil {
		logger.Error(versionErr.Error(), slimlog.Function(FN), zap.String("error", "versionErr"))
		return
	}
	logger.Info("Database Migration Version", zap.Uint("version", version))
	var seedDB = DB{
		Connection: db,
		Migration: Migration{
			Dirty:   dirty,
			Version: version,
		},
	}
	SeedCuttersTable(&seedDB)
	SeedDDC(&seedDB)
}
func SeedCuttersTable(DB *DB) {
	const FN = "db.SeedCuttersTable"
	const CREATE_TABLE_QUERY = `
		CREATE TABLE  book.cutters(
		id integer primary key generated always as identity,
		surname varchar(100),
		number int
		 )
	`
	_, err := DB.Connection.Exec(CREATE_TABLE_QUERY)
	if err != nil {
		logger.Warn(err.Error(), slimlog.Function(FN))
		return
	}
	dialect := goqu.Dialect("postgres")
	ds := dialect.Insert("book.cutters").Cols("number", "surname")
	for _, cutter := range cutters.LoadWholeArray() {
		ds = ds.Vals(goqu.Vals{cutter["number"], cutter["surname"]})
	}
	insertQuery, _, _ := ds.ToSQL()
	_, insertErr := DB.Connection.Exec(insertQuery)
	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function(FN))
	}
	logger.Info("Author number seeded", slimlog.Function(FN))
}

func SeedDDC(DB *DB) {
	const FN = "db.SeedDDC"
	const CREATE_TABLE_QUERY = `
		CREATE TABLE  book.ddc(
		id integer primary key generated always as identity,
		name varchar(200),
		number numeric
		 )
	`

	_, err := DB.Connection.Exec(CREATE_TABLE_QUERY)
	if err != nil {
		logger.Warn(err.Error(), slimlog.Function(FN))
		return
	}

	dialect := goqu.Dialect("postgres")
	ds := dialect.Insert("book.ddc").Cols("number", "name")
	for _, ddc := range dewey.LoadFromJSON() {
		fmt.Println(ddc.Number)
		ds = ds.Vals(goqu.Vals{ddc.Number, ddc.Name})
	}

	insertQuery, _, _ := ds.ToSQL()

	_, insertErr := DB.Connection.Exec(insertQuery)

	if insertErr != nil {
		logger.Error(insertErr.Error(), slimlog.Function(FN))
	}
	logger.Info("DDC seeded", slimlog.Function(FN))
}
