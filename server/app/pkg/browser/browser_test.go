package browser

import (
	"testing"
	"time"
)
var tb * Browser; //test browser


func TestCreateBrowser(t *testing.T){
	b, err := NewBrowser()
	tb = b
	if err != nil {
		t.Error(err.Error())
		return
	}
	t.Log("Create Browser")
}
func TestCreatePages(t *testing.T){
	const MaxNumberOfPages = 5
	for i := 0; i < MaxNumberOfPages; i++ {
		tb.GetPageFromPool()
	}
	b := tb.GetBrowser()
	pages, err  := b.Pages()
	if err != nil {
		t.Error(err.Error())
		return
	}
	if(len(pages) != MaxNumberOfPages){
		t.Fail()
	}
	err = tb.ReturnPagesToPool()
	if err != nil {
		t.Error(err.Error())
		return
	}
	t.Log("Create pages")	
}

func TestCreatePagesShouldWait(t *testing.T){
	const MaxNumberOfPages = 5
	const WaitTime = 5 * time.Second

	t.Log(WaitTime)
	job := func(id int){
		page := tb.GetPageFromPool()
		if id + 1 == MaxNumberOfPages{
			go func  ()  {
				time.Sleep(WaitTime)
				tb.ReturnPageToPool(page)
			}()
		}
	}
	for i := 0; i < MaxNumberOfPages; i++ {
		job(i)
	}
	start:= time.Now()
	tb.GetPageFromPool()
	end := time.Now()
	elapsed := end.Sub(start).Round(time.Second)
	if elapsed != WaitTime{
		t.Error("Did not meet expected wait time")
		return
	}
	tb.ReturnPagesToPool()
	t.Log("Create Pages and should wait for pool to be free.")	
}
func TestCloseBrowser(t * testing.T){
	tb.Close()
}



