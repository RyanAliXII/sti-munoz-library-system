package repository

import (
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/filter"
	"github.com/RyanAliXII/sti-munoz-library-system/server/model"
	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
)


type DeviceLogFilter struct {
	From string
	To string
	filter.Filter
}
func (repo * Device) NewDeviceLog(log model.DeviceLog) error {
	_, err := repo.db.Exec("INSERT INTO services.device_log(account_id, device_id) VALUES($1, $2)", log.AccountId, log.DeviceId)
	return err
}

func (repo * Device) GetDeviceLogs(filter * DeviceLogFilter) ([]model.DeviceLog, Metadata, error) {
	logs := make([]model.DeviceLog, 0)
	metadata := Metadata{}
	dialect := goqu.Dialect("postgres")
	ds := dialect.Select(
		goqu.C("id").Table("device_log"),
		goqu.C("device_id"),
		goqu.C("json_format").Table("account").As("client"),
		goqu.C("logged_out_at"),
		goqu.L("(case when logged_out_at is null then false else true end)").As("is_logged_out"), 
		goqu.L(`
		json_build_object(
			'id',device.id, 
			'name', device.name,
			'description', device.description)
	    `).As("device"),
		goqu.C("created_at").Table("device_log"),
	).From(goqu.T("device_log").Schema("services")).
	Prepared(true).
	InnerJoin(goqu.T("account_view").As("account"), goqu.On(goqu.Ex{
		"device_log.account_id": goqu.I("account.id"),
	})).
	InnerJoin(goqu.T("device").Schema("services"), goqu.On(goqu.Ex{
		"device_log.device_id": goqu.I("device.id"),
	}))

	ds = repo.buildDeviceLogFilters(ds, filter)
	ds = ds.Order(exp.NewOrderedExpression(goqu.I("device_log.created_at"), exp.DescSortDir, exp.NoNullsSortType)).
	Limit(uint(filter.Limit)).
	Offset(uint(filter.Offset))
	query, args, err := ds.ToSQL()
	if err != nil {
		return logs, metadata, err
	}
	err = repo.db.Select(&logs, query, args...)
	if err != nil {
		return logs, metadata, err
	}
	ds = repo.buildDeviceLogMetadataQuery(filter)
	query, args, err = ds.ToSQL()
	if err != nil {
		return logs, metadata, err
	}
	err = repo.db.Get(&metadata, query, args...)
	if err != nil {
		return logs, metadata, err
	}
	return logs, metadata, err
}

func (repo * Device)DeviceLogout(id string) error {	
	_, err := repo.db.Exec("UPDATE services.device_log set logged_out_at = now() where id = $1 and logged_out_at is null", id)
	return err
}

func (repo *Device)buildDeviceLogFilters(ds * goqu.SelectDataset, filter * DeviceLogFilter)*goqu.SelectDataset{
	if(len(filter.From) > 0 && len(filter.To) > 0) {
		ds = ds.Where(
			goqu.L("date(device_log.created_at at time zone 'PHT')").Between(goqu.Range(filter.From, filter.To)),
		) 
	}
	keyword := filter.Keyword
	if(len(keyword) > 0 ){
		ds = ds.Where(
			goqu.L(`	
		   (account.search_vector @@ (phraseto_tsquery('simple', ?) :: text) :: tsquery  
			OR 
			account.search_vector @@ (plainto_tsquery('simple', ?)::text) :: tsquery
			OR
			account.email ILIKE '%' || ? || '%'
			OR 
			account.given_name ILIKE '%' || ? || '%'
			OR
			account.surname ILIKE'%' || ? || '%'
		    OR
			device.name ILIKE'%' || ? || '%'
			OR
			device.description ILIKE '%' || ? || '%'
		    )
		  `, keyword, keyword, keyword, keyword, keyword, keyword, keyword ),
		)
	}
	return ds
}
func(repo *Device)buildDeviceLogMetadataQuery(filter * DeviceLogFilter)*goqu.SelectDataset {
	dialect := goqu.Dialect("postgres")	
	ds := dialect.Select(
		goqu.Case().When(goqu.COUNT(1).Eq(0), 0).Else(goqu.L("Ceil((COUNT(1)/?::numeric))::bigint", filter.Limit)).As("pages"),
		goqu.COUNT(1).As("records"),
	).From(goqu.T("device_log").Schema("services"))
	ds = repo.buildDeviceLogFilters(ds, filter)
	return ds
}