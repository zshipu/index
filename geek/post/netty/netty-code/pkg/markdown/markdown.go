package markdown

import (
	"fmt"
	"os"
	"regexp"
	"strings"
)

var (
	codeBlockRegex = regexp.MustCompile("(?s)(```.+?```)")
	htmlRegex      = regexp.MustCompile("(?s)(<[^>]+>)")
	imgRegex       = regexp.MustCompile(`<img[^>]+src="([^">]+)"`)
	mdImgRegex     = regexp.MustCompile(`!\[.*?\]\((.*?)\)`)
)

// ReplaceImageURLs reads a Markdown file and replaces all image URLs
func ReplaceImageURLs(filePath string, urlReplacer func(string) (string, error)) error {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("error reading file: %v", err)
	}

	matches := imgRegex.FindAllStringSubmatch(string(content), -1)

	newContent := string(content)
	processedURLs := make(map[string]string) // Cache for processed URLs

	for _, match := range matches {
		oldURL := match[1]

		// Check if URL has already been processed
		if newURL, exists := processedURLs[oldURL]; exists {
			newContent = strings.ReplaceAll(newContent, oldURL, newURL)
			continue
		}

		if strings.Contains(oldURL, "jsdelivr") || strings.Contains(oldURL, "995120") {
			continue
		}

		newURL, err := urlReplacer(oldURL)
		if err != nil {
			return fmt.Errorf("error replacing URL %s: %v", oldURL, err)
		}

		processedURLs[oldURL] = newURL // Cache the processed URL
		newContent = strings.ReplaceAll(newContent, oldURL, newURL)
	}

	// Compare content before writing
	currentContent, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("error reading current file content: %v", err)
	}

	if string(currentContent) == newContent {
		return nil
	}

	if err := os.WriteFile(filePath, []byte(newContent), 0644); err != nil {
		return fmt.Errorf("error writing file: %v", err)
	}

	return nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// ReplaceImageURLsMd replaces image URLs in markdown content
func ReplaceImageURLsMd(filePath string, urlProcessor func(string) (string, error)) error {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("error reading file: %v", err)
	}

	if len(content) == 0 {
		return nil
	}

	processedContent := string(content)
	imagePattern := regexp.MustCompile(`!\[([^\]]*)\]\(([^)]+)\)`)
	matches := imagePattern.FindAllStringSubmatchIndex(processedContent, -1)

	if len(matches) == 0 {
		return nil
	}

	var lastIndex int
	var result strings.Builder

	for _, match := range matches {
		urlStart := match[4]
		urlEnd := match[5]
		oldURL := processedContent[urlStart:urlEnd]

		newURL, err := urlProcessor(oldURL)
		if err != nil {
			return fmt.Errorf("error processing URL: %v", err)
		}

		result.WriteString(processedContent[lastIndex:urlStart])
		result.WriteString(newURL)
		lastIndex = urlEnd
	}

	result.WriteString(processedContent[lastIndex:])
	newContent := result.String()

	if newContent == string(content) {
		return nil
	}

	err = os.WriteFile(filePath, []byte(newContent), 0644)
	if err != nil {
		return fmt.Errorf("error writing file: %v", err)
	}

	return nil
}

// ConvertHTMLToMarkdown converts HTML tags to Markdown format
func ConvertHTMLToMarkdown(html string) string {
	// Replace common HTML tags with Markdown equivalents
	replacements := map[string]string{
		"<strong>":  "**",
		"</strong>": "**",
		"<em>":      "_",
		"</em>":     "_",
		"<code>":    "`",
		"</code>":   "`",
		"<br>":      "\n",
		"<br/>":     "\n",
		"<br />":    "\n",
	}

	result := html
	for old, new := range replacements {
		result = strings.ReplaceAll(result, old, new)
	}

	return result
}

// ReplaceCodeHTML replaces HTML code blocks with Markdown format
func ReplaceCodeHTML(content string) string {
	// Save code blocks
	codeBlocks := codeBlockRegex.FindAllString(content, -1)

	// Replace code blocks with placeholders
	content = codeBlockRegex.ReplaceAllString(content, "___CODE_BLOCK___")

	// Convert HTML to Markdown
	content = ConvertHTMLToMarkdown(content)

	// Restore code blocks
	for _, block := range codeBlocks {
		content = strings.Replace(content, "___CODE_BLOCK___", block, 1)
	}

	return content
}
