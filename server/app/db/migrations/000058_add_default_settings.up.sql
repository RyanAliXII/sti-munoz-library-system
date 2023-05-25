truncate table system.settings;
INSERT INTO system.settings(value)VALUES('
{
    "app.due-penalty": {
        "id":"app.due-penalty",
        "label":"Due Penalty",
        "description": "Amount of penalty per day until borrowed books has not been returned.",
        "value": 2    
    }
}')