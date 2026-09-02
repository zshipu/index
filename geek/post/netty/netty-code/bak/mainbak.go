package main

import (
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/fsnotify/fsnotify"

	"md2article/pkg/config"
	"md2article/pkg/markdown"
	"md2article/pkg/upload"
	"md2article/pkg/utils"
)

var (
	//startTime       time.Time
	//mutex           sync.Mutex
	cfg             *config.Config
	processingFiles sync.Map // Track files being processed
	processingLock  sync.Mutex
)

func main2() {
	// 设置日志格式，包含日期、时间、文件名和行号
	log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)

	cfg, err := config.LoadConfig("config.json")
	if err != nil {
		log.Fatalf("Error loading config: %v", err)
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("Error creating watcher: %v", err)
	}
	defer watcher.Close()

	processingFiles := make(map[string]bool)
	var mu sync.Mutex

	go watchDir2(watcher, cfg, processingFiles, &mu)

	err = watcher.Add(cfg.WatchDir)
	if err != nil {
		log.Fatalf("Error adding directory to watcher: %v", err)
	}

	select {}
}

func watchDir2(watcher *fsnotify.Watcher, cfg *config.Config, processingFiles map[string]bool, mu *sync.Mutex) {
	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}

			if event.Op&fsnotify.Write == fsnotify.Write {
				filePath := event.Name
				if !strings.HasSuffix(filePath, ".md") {
					continue
				}

				mu.Lock()
				if processingFiles[filePath] {
					mu.Unlock()
					continue
				}
				processingFiles[filePath] = true
				mu.Unlock()

				go func(path string) {
					defer func() {
						mu.Lock()
						delete(processingFiles, path)
						mu.Unlock()
					}()
					processFile(path, cfg)
				}(filePath)
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			log.Printf("Error: %v", err)
		}
	}
}

func processFile(filePath string, cfg *config.Config) {
	time.Sleep(100 * time.Millisecond)

	originalContent, err := os.ReadFile(filePath)
	if err != nil {
		log.Printf("Error reading file %s: %v", filePath, err)
		return
	}

	err = markdown.ReplaceImageURLsMd(filePath, func(url string) (string, error) {
		cleanURL := utils.ExtractURL(url)
		return upload.UploadFile(cleanURL)
	})
	if err != nil {
		log.Printf("Error processing image URLs in %s: %v", filePath, err)
		restoreErr := os.WriteFile(filePath, originalContent, 0644)
		if restoreErr != nil {
			log.Printf("Error restoring original content: %v", restoreErr)
		}
		return
	}

	log.Printf("Successfully processed file: %s", filePath)
}
