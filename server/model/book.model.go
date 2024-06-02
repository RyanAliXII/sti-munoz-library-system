package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"

	"github.com/RyanAliXII/sti-munoz-library-system/server/app/db"
	"github.com/RyanAliXII/sti-munoz-library-system/server/app/pkg/postgresdb"
	validation "github.com/go-ozzo/ozzo-validation"

	"github.com/lib/pq"
)

type Book struct {
	Id          string `json:"id" db:"id"`
	Title       string `json:"title" db:"title"`
	Subject		string `json:"subject" db:"subject"`
	Description string `json:"description" db:"description"`
	ISBN        string `json:"isbn" db:"isbn"`
	Pages       int    `json:"pages" db:"pages"`

	Copies		int `json:"copies" db:"copies"`
	Section    SectionJSON    `json:"section" db:"section"`
	Publisher  PublisherJSON  `json:"publisher" db:"publisher"`
	SourceOfFund string `json:"source_of_fund" db:"source_of_fund"`
	AccessionTable string `json:"accessionTable" db:"accession_table"`
	CostPrice     float32         `json:"costPrice,omitempty" db:"cost_price"`
	Edition       int             `json:"edition" db:"edition"`
	YearPublished int             `json:"yearPublished" db:"year_published"`
	ReceivedAt    db.NullableDate `json:"receivedAt" db:"received_at"`
	DDC           string          `json:"ddc" db:"ddc"`
	AuthorNumber  string          `json:"authorNumber" db:"author_number"`
	Ebook		  string 		  `json:"ebook" db:"ebook"`
	Authors    AuthorsJSON     `json:"authors" db:"authors"`
	Accessions AccessionsJSON  `json:"accessions,omitempty" db:"accessions"`
	Covers     pq.StringArray  `json:"covers" db:"covers"`
	SearchTags pq.StringArray  `json:"searchTags,omitempty" db:"search_tags"`
	CreatedAt  db.NullableTime `json:"createdAt" db:"created_at"`
	
}

type BookImport struct {
	Title         string `json:"title" db:"title" csv:"title"`
	Description   string `json:"description" db:"description" csv:"description"`
	AccessionNumber int `json:"accessionNumber" db:"accession" csv:"accession_number"`
	ISBN          string `json:"isbn" db:"isbn" csv:"isbn"`
	YearPublished int `json:"year_published" db:"year_published" csv:"year_published"`
	Copies        int    `json:"copies" db:"copies" csv:"copies"`
	Pages         int    `json:"pages" db:"pages" csv:"pages"`
	Edition       int  	 `json:"edition" db:"edition" csv:"edition"`
	CostPrice	  int `json:"cost_price" db:"cost_price"`
	Author        string `json:"author" db:"author" csv:"author"`
	Publisher 	  string `json:"publisher" db:"publisher" csv:"publisher"`
	DDC           string `json:"ddc" db:"ddc" csv:"ddc"`
	SourceOfFund string `json:"sourceOfFund" db:"source_of_fund" csv:"source_of_fund"`
	AuthorNumber  string  `json:"authorNumber" db:"author_number" csv:"author_number"`
}
type BookExport struct {
	Title         string `json:"title" db:"title" csv:"title"`
	Description   string `json:"description" db:"description" csv:"description"`
	AccessionNumber int `json:"accessionNumber" db:"accession_number" csv:"accession_number"`
	Subject string `json:"subject" db:"subject" csv:"subject"`
	AccessionId   string `json:"accessionId" db:"accession_id" csv:"accession_id"`
	BookId string `json:"bookId" db:"book_id" csv:"book_id"`
	CopyNumber 	  int `json:"copyNumber" db:"copy_number" csv:"copy_number"`
	ISBN          string `json:"isbn" db:"isbn" csv:"isbn"`
	YearPublished int `json:"year_published" db:"year_published" csv:"year_published"`
	ReceivedAt string `json:"received_at" db:"received_at" csv:"received_at"`
	Pages         int    `json:"pages" db:"pages" csv:"pages"`
	Edition       int  	 `json:"edition" db:"edition" csv:"edition"`
	CostPrice	  int `json:"cost_price" db:"cost_price" csv:"cost_price"`
	Author        string `json:"author" db:"author" csv:"author"`
	Publisher 	  string `json:"publisher" db:"publisher" csv:"publisher"`
	DDC           string `json:"ddc" db:"ddc" csv:"ddc"`
	SourceOfFund string `json:"sourceOfFund" db:"source_of_fund" csv:"source_of_fund"`
	AuthorNumber  string  `json:"authorNumber" db:"author_number" csv:"author_number"`
	Ebook string `json:"ebook" db:"ebook" csv:"ebook"`
}

func (book * Book)ValidateIfAccessionExistsOrDuplicate()([]map[string]string,bool, error){
	accessionTable := ""
	db := postgresdb.GetOrCreateInstance()
	transaction, err := db.Beginx()
	accessions := make([]map[string]string, 0)
	if err != nil {
		return  accessions,false, err
	}
	err = transaction.Get(&accessionTable, "SELECT accession_table from catalog.section where id = $1", book.Section.Id)
	if err != nil {
		transaction.Rollback()
		return accessions, false, err
	}
	hasExistingOrDuplicate := false
	occured := make(map[int]struct{})
	for _, accession := range book.Accessions {
		if(accession.Number == 0){
			accessions = append(accessions, map[string]string{
				"number": "",
			})
			continue;
		}
		_, hasOccured := occured[accession.Number]
		if hasOccured {
			hasExistingOrDuplicate = true
			accessions = append(accessions, map[string]string{
				"number": fmt.Sprintf("%d is already defined.", accession.Number),
			})
			continue;
		} 
		isExists := true
		query := `SELECT EXISTS( SELECT 1 from catalog.accession 
			INNER JOIN catalog.book on accession.book_id = book.id
			INNER JOIN catalog.section on book.section_id = section.id
			where number = $1 and section.deleted_at is null and accession_table = $2
		)`
		err := db.Get(&isExists, query, accession.Number, accessionTable)
		if err != nil {
			return accessions,false,err
		}
		if isExists {
			hasExistingOrDuplicate = true
			accessions = append(accessions, map[string]string{
				"number": "Accession number already exists.",
			})
		}else{
			accessions = append(accessions, map[string]string{
				"number": "",
			})
		}
		occured[accession.Number] = struct{}{}
		
	}
	return accessions, hasExistingOrDuplicate, nil

}
type BookJSON struct {
	Book
}

func (book *BookJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, book)
		if unmarshalErr != nil {
			*book = BookJSON{
				Book: Book{},
			}
		}
	} else {
		*book = BookJSON{
			Book: Book{},
		}

	}
	
	return nil

}
func (book BookJSON) Value(value interface{}) (driver.Value, error) {
	return book, nil
}

type Accession struct {
	Id           string   `json:"id"`
	Number       int      `json:"number" db:"number" copier:"Number"`
	CopyNumber   int      `json:"copyNumber" db:"copy_number"`
	BookId       string   `json:"bookId" db:"book_id" copier:"BookId"`
	IsCheckedOut bool     `json:"isCheckedOut" db:"is_checked_out"`
	IsAvailable  bool     `json:"isAvailable" db:"is_available"`
	IsWeeded     bool `json:"isWeeded" db:"is_weeded"`
	IsMissing    bool `json:"isMissing" db:"is_missing"`
	Remarks     string `json:"remarks" db:"remarks"`
	Book         BookJSON `json:"book" db:"book"`
	Model
}
func(m * Accession)ValidateUpdate() (validation.Errors, error) {
	db := postgresdb.GetOrCreateInstance()
	return m.Model.Validate(m, validation.Field(&m.Number, 
		validation.Required.Error("Accession number is required."),
		validation.Min(1).Error("Accession number must be greater than 0"),
		validation.By(func(value interface{}) error {
			accessionTable := ""
			query := `SELECT accession_table from catalog.accession
			INNER JOIN catalog.book on accession.book_id = book.id
			INNER JOIN catalog.section on book.section_id = section.id
			where accession.id = $1
			LIMIT 1
			`
			
			err := db.Get(&accessionTable, query, m.Id)
			if err != nil {
				return err
			}
			query = `SELECT EXISTS (SELECT 1 from catalog.accession
			INNER JOIN catalog.book on accession.book_id = book.id
			INNER JOIN catalog.section on book.section_id = section.id
			where accession.number = $1 and section.accession_table = $2)`
			isExists := true
			err = db.Get(&isExists, query, m.Number, accessionTable)
			if err != nil {
				return err
			}
			if(isExists){
				return fmt.Errorf("accession number exists")
			}
			return nil
		}),
	   ))
	

}
type AccessionsJSON []struct {
	Id         string `json:"id"`
	Number     int    `json:"number" db:"number"`
	IsAvailable  bool  `json:"isAvailable" db:"is_available"`
	CopyNumber int    `json:"copyNumber" db:"copy_number"`
}

func (ba *AccessionsJSON) Scan(value interface{}) error {
	val, valid := value.([]byte)
	if valid {
		unmarshalErr := json.Unmarshal(val, ba)
		if unmarshalErr != nil {
			*ba = make(AccessionsJSON, 0)
		}

	} else {
		*ba = make(AccessionsJSON, 0)
	}
	return nil

}

func (ba AccessionsJSON) Value(value interface{}) (driver.Value, error) {
	return ba, nil
}

type BookCover struct {
	Id     int    `json:"int" db:"id"`
	BookId string `json:"bookId" db:"book_id"`
	Path   string `json:"path" db:"path"`
}


type AccessionCounter struct {
	Accession string `json:"accession" db:"accession"`
	LastValue int `json:"lastValue" db:"last_value"`
}

