package browser

import (
	"sync"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
)

var once sync.Once;
var browser * Browser

type Browser struct {
	b * rod.Browser
	launcher * launcher.Launcher
	pagePool * rod.PagePool
	
}
func (browser * Browser)GetBrowser()*rod.Browser{
	return browser.b
}
func NewBrowser() (*Browser, error){
	var err error = nil
	once.Do(func ()  {
		path, _ := launcher.LookPath()
		if(path == ""){
			panic("Chromium binary not found.")
		}
		launcher := launcher.New().Headless(true).Bin(path).Leakless(true)
		url, err := launcher.Launch()
		if err != nil {
			return
		}
		b := rod.New().ControlURL(url)
		err = b.Connect()
		if err != nil {
			return
		}
		pagePool := rod.NewPagePool(5)
		browser = &Browser{
			b: b,
			pagePool: &pagePool,
			launcher: launcher,
		}
	})
	return browser, err
}
func(b * Browser) GetPageFromPool() *rod.Page {
	page := b.pagePool.Get(func () * rod.Page{
		return b.b.MustIncognito().MustPage()
	})
	return page
}
func (b * Browser)GetPagePool() *rod.PagePool{
	return b.pagePool
}
func(b * Browser)ReturnPageToPool(p * rod.Page){
	b.pagePool.Put(p)
}
func(b * Browser)ReturnPagesToPool()(error){
	pages, err := b.b.Pages()
	if err != nil {
		return err
	}
	for _, p := range pages{
		b.pagePool.Put(p)
	}
	return nil
}
func (browser * Browser)Close(){
	if(browser.b != nil){
		browser.b.Close()
	}
}
