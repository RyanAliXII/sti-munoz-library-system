# Database Migration
**To run migration, You need to go inside the container. For list of commands, Run the following.**

    migrate -help

**Sample command to create a migration**

    migrate create -ext sql -dir <YOUR MIGRATIONS DIRECTORY> -seq <NAME OF MIGRATION>
    
 **Sample command of up and down migration**

    migrate -path app/db/migrations -database postgres://<USERNAME><PASSWORD>@<HOST>/<DB_NAME>?sslmode=disable up
### **Do not include <> when running the command.**

  