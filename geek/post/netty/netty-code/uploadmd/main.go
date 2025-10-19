package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

const uploadPath = "."

func main() {
	// Create uploads directory if it doesn't exist
	if err := os.MkdirAll(uploadPath, os.ModePerm); err != nil {
		log.Fatal(err)
	}

	// Define routes
	http.HandleFunc("/upload", uploadHandler)
	http.HandleFunc("/", indexHandler)

	// Start server
	fmt.Println("Server starting on :8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	html := `
    <!DOCTYPE html>
    <html>
        <head>
            <title>File Upload</title>
        </head>
        <body>
            <h2>File Upload</h2>
            <form action="/upload" method="post" enctype="multipart/form-data">
                <input type="file" name="file">
                <input type="submit" value="Upload">
            </form>
        </body>
    </html>
    `
	w.Write([]byte(html))
}

func uploadHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the multipart form
	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB max
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error retrieving file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create file path
	filename := filepath.Join(uploadPath, handler.Filename)

	// Create the file
	dst, err := os.Create(filename)
	if err != nil {
		http.Error(w, "Error creating file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copy the uploaded file to the created file
	if _, err := dst.ReadFrom(file); err != nil {
		http.Error(w, "Error saving file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "File uploaded successfully: %s", handler.Filename)
}
