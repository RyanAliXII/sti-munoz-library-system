truncate table system.settings;
INSERT INTO system.settings(value)VALUES('
{
    "app.due-penalty": {
        "id":"app.due-penalty",
        "label":"Due Penalty",
        "type": "int",
        "defaultValue": 2 ,
        "description": "Amount of penalty per day until borrowed books has not been returned.",
        "value": 2    
    },
    "app.max-reservation":{
        "id" :"app.max-reservation",
        "label" : "Maximum Reservation",
        "type": "int",
        "defaultValue": 1,
        "description" : "Maximum reservation per user and day.",
        "value" : 1
    },
    "app.days-to-due-date":{
        "id":"app.days-to-due-date",
        "label": "Days to Due Date",
        "type": "int",
        "defaultValue": 3,
        "description": "The number represents the number of days to be added to the current date to determine the due date of borrowed books.",
        "value" : 3
    },
    "app.account-validity": {
        "id": "app.account-validity",
        "label": "Account Validity",
        "description": "The date will be used to determine the period of account validity. After this date, the user''s account may require renewal or reactivation.",
        "type": "date",
        "defaultValue": "2023-12-04",
        "value": "2023-12-04"
    }
}')

