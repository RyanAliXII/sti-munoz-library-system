DROP VIEW IF EXISTS reservation_view;
CREATE OR REPLACE VIEW reservation_view AS
SELECT reservation.id, reservation.date_slot_id, 
	reservation.time_slot_id, reservation.device_id, 
	reservation.account_id, 
	remarks,
	status_id,
	date_slot.date as reservation_date,
	time_slot.start_time as reservation_time,
	(reservation_status.description) as status,
	account.json_format as client,	
	JSONB_BUILD_OBJECT(
	'id', date_slot.id ,
	'date', date_slot.date
	) as date_slot,
	JSONB_BUILD_OBJECT(
	'id', time_slot.id, 
	'startTime', time_slot.start_time,
	'endTime', time_slot.end_time,
	'profileId', time_slot.profile_id
	) as time_slot, 
	JSONB_BUILD_OBJECT(
	'id', device.id, 
	'name', device.name,
	'description', device.description
	) as device, 
	reservation.created_at 
	from services.reservation
	INNER JOIN services.date_slot on date_slot_id = date_slot.id and date_slot.deleted_at is null
	INNER JOIN services.time_slot on time_slot_id = time_slot.id and time_slot.deleted_at is null
	INNER JOIN services.device on device_id = device.id and device.deleted_at is null
	INNER JOIN account_view as account on reservation.account_id = account.id
	INNER JOIN services.reservation_status on status_id = reservation_status.id;

ALTER TABLE IF EXISTS services.device
DROP COLUMN IF EXISTS available; 
