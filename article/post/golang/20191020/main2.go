package main

import (
	"bufio"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"time"
)

func main() {
	fmt.Println("helo")
	ReSetPhotoNames2()
}

func ReSetPhotoNames2() {
	photoFolder := "D:\\gowww\\blog\\article\\content\\post\\golang\\20191020"
	dealpath(photoFolder)
}
func dealpath(photoFolder string) {
	files, _ := ioutil.ReadDir(photoFolder)
	for _, file := range files {
		if file.IsDir() {
			subpath := file.Name()
			fpath := photoFolder + "\\" + subpath
			dealpath(fpath)
		} else {
			fileName := file.Name()
			fpath := photoFolder + "\\" + fileName
			fmt.Println(fpath)
			dotIndex := strings.LastIndex(fileName, ".")
			if dotIndex < 0 {
				continue
			}
			fmt.Println(dotIndex)
			if fileName[dotIndex:] == ".md"{

				fmt.Println(fpath)
				f2, err := os.Open(fpath)
				if err != nil {
					continue
				}
				defer f2.Close()
				rd := bufio.NewReader(f2)
				title, err := rd.ReadString('\n')
				if err != nil {
					continue
				}
				title = strings.Replace(title,"#","" ,-1)
				title = strings.Replace(title,"\n","" ,-1)
				title = strings.Replace(title,"\r","" ,-1)
				title = strings.Replace(title,"《","" ,-1)
				title = strings.Replace(title,"》","" ,-1)
				title = strings.Replace(title, "\uFEFF", "", -1)

				bytes, err := ioutil.ReadFile(fpath)
				if err != nil {
					fmt.Println("error : %s", err)
					continue
				}
				content := string(bytes)
				timestamp := time.Now().Unix()
				tm := time.Unix(timestamp, 0)
				formattimestr := tm.Format("2006-01-02T15:04:05Z07:00")
				fmt.Println(formattimestr)
				fmt.Println(tm.Format("2006-01-02T15:04:05Z07:00"))

				folderIdx :=strings.LastIndex(photoFolder,"\\")
				prxf := photoFolder[folderIdx+1:]

				prx :=`---
categories:
- golang
tags:
- golang,从零开始golang  
keywords: 知识铺
date: `+formattimestr+`
title: `+prxf+"-"+title+`
author: 知识铺
weight: -1
---

`;
				f, err := os.OpenFile(fpath, os.O_WRONLY|os.O_TRUNC, 0600)
				defer f.Close()
				num, err := f.WriteString(prx+content)
				fmt.Println(num)
			}

		}
	}
}