package main

import (
	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
)

func main() {
	s := g.Server()
	s.BindHandler("/template", func(r *ghttp.Request) {
		r.Response.WriteTpl("static/index.html", g.Map{
			"id":   123,
			"name": "john",
		})
	})
	s.SetPort(8199)
	s.Run()
}
