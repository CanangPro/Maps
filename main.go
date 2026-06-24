package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"html"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

//go:embed templates/*
var templatesFS embed.FS

//go:embed static/*
var staticFS embed.FS

type SteamRecommendation struct {
	AppID       string `json:"appId"`
	Title       string `json:"title"`
	Image       string `json:"image"`
	Playtime    string `json:"playtime"`
	Recommend   bool   `json:"recommend"`
	Description string `json:"description"`
}

var fallbackRecommendations = []SteamRecommendation{
	{
		AppID:       "3678970",
		Title:       "TBH: Task Bar Hero",
		Image:       "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3678970/124cbad7c55f19814d0b8f019e06e5a50b8c6337/capsule_184x69.jpg?t=1780512075",
		Playtime:    "37.5 hrs on record",
		Recommend:   true,
		Description: "i recommended",
	},
	{
		AppID:       "1238000",
		Title:       "Mass Effect Legendary Edition",
		Image:       "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1238000/capsule_184x69.jpg?t=1779987589",
		Playtime:    "34.1 hrs on record",
		Recommend:   true,
		Description: "Need Mass Effect 4 RN!",
	},
	{
		AppID:       "220240",
		Title:       "Far Cry 3",
		Image:       "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/220240/capsule_184x69.jpg?t=1752169206",
		Playtime:    "42.4 hrs on record",
		Recommend:   true,
		Description: "Best series so far for FarCry Series..",
	},
	{
		AppID:       "1172470",
		Title:       "Apex Legends™",
		Image:       "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1172470/b622efa206400324df2ab812786578dda4cc3537/capsule_184x69.jpg?t=1778502442",
		Playtime:    "105.1 hrs on record",
		Recommend:   false,
		Description: "didnt recommended",
	},
}

var (
	gameNamesCacheMutex sync.RWMutex
	gameNamesCache      = map[string]string{
		"1172470": "Apex Legends™",
		"714010":  "Aimlabs",
		"346900":  "AdVenture Capitalist",
		"761890":  "Albion Online",
		"3678970": "TBH: Task Bar Hero",
		"3224770": "Umamusume: Pretty Derby",
		"1238000": "Mass Effect Legendary Edition",
		"523650":  "Lust for Darkness",
		"220240":  "Far Cry 3",
		"57690":   "Tropico 4",
	}
)

func fetchGameName(appID string) string {
	url := fmt.Sprintf("https://store.steampowered.com/api/appdetails?appids=%s", appID)
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		log.Printf("error fetching game name for %s: %v", appID, err)
		return ""
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 512*1024))
	if err != nil {
		log.Printf("error reading game name body for %s: %v", appID, err)
		return ""
	}

	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		log.Printf("error unmarshalling game name json for %s: %v", appID, err)
		return ""
	}

	if appData, ok := data[appID].(map[string]interface{}); ok {
		if success, ok := appData["success"].(bool); ok && success {
			if info, ok := appData["data"].(map[string]interface{}); ok {
				if name, ok := info["name"].(string); ok {
					return name
				}
			}
		}
	}
	return ""
}

func getGameName(appID string) string {
	gameNamesCacheMutex.RLock()
	name, ok := gameNamesCache[appID]
	gameNamesCacheMutex.RUnlock()
	if ok {
		return name
	}

	gameNamesCacheMutex.Lock()
	// Double-check after acquiring write lock
	if name, ok := gameNamesCache[appID]; ok {
		gameNamesCacheMutex.Unlock()
		return name
	}

	fetchedName := fetchGameName(appID)
	if fetchedName == "" {
		fetchedName = "Steam Game (ID: " + appID + ")"
	}
	gameNamesCache[appID] = fetchedName
	gameNamesCacheMutex.Unlock()
	return fetchedName
}

func extractBetween(text, start, end string) string {
	startIndex := strings.Index(text, start)
	if startIndex == -1 {
		return ""
	}
	startIndex += len(start)
	endIndex := strings.Index(text[startIndex:], end)
	if endIndex == -1 {
		return ""
	}
	return text[startIndex : startIndex+endIndex]
}

func cleanHTML(s string) string {
	s = strings.ReplaceAll(s, "<br>", "\n")
	s = strings.ReplaceAll(s, "<br/>", "\n")
	s = strings.ReplaceAll(s, "<br />", "\n")
	var builder strings.Builder
	inTag := false
	for _, r := range s {
		if r == '<' {
			inTag = true
		} else if r == '>' {
			inTag = false
		} else if !inTag {
			builder.WriteRune(r)
		}
	}
	result := html.UnescapeString(builder.String())
	return strings.Join(strings.Fields(result), " ")
}

func fetchSteamRecommendations() []SteamRecommendation {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Get("https://steamcommunity.com/id/mz_ganteng/recommended/")
	if err != nil {
		log.Printf("error fetching steam recommended page: %v, using fallback", err)
		return fallbackRecommendations
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("steam returned status %d, using fallback", resp.StatusCode)
		return fallbackRecommendations
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*1024))
	if err != nil {
		log.Printf("error reading steam response: %v, using fallback", err)
		return fallbackRecommendations
	}

	htmlStr := string(body)
	reviewBlocks := strings.Split(htmlStr, "class=\"review_box\">")
	if len(reviewBlocks) <= 1 {
		log.Printf("found no individual review_box items, using fallback")
		return fallbackRecommendations
	}

	var recs []SteamRecommendation
	for i := 1; i < len(reviewBlocks); i++ {
		block := reviewBlocks[i]

		// Extract App ID from the capsule link
		appID := extractBetween(block, "https://steamcommunity.com/app/", "\"")
		if appID == "" {
			appID = extractBetween(block, "/recommended/", "/")
		}
		if appID == "" {
			continue
		}

		// Extract Capsule Image
		image := extractBetween(block, "class=\"game_capsule\"src=\"", "\"")
		if image == "" {
			image = extractBetween(block, "class=\"game_capsule\" src=\"", "\"")
		}

		// Extract Recommended Status
		recommend := true
		if strings.Contains(block, "icon_thumbsDown.png") || strings.Contains(block, "Not Recommended") {
			recommend = false
		}

		// Extract Playtime Hours
		hoursRaw := extractBetween(block, "class=\"hours\">", "</div>")
		hours := strings.TrimSpace(cleanHTML(hoursRaw))
		hours = strings.Join(strings.Fields(hours), " ")

		// Extract Review Content
		descriptionRaw := extractBetween(block, "class=\"content \">", "</div>")
		if descriptionRaw == "" {
			descriptionRaw = extractBetween(block, "class=\"content\">", "</div>")
		}
		description := strings.TrimSpace(cleanHTML(descriptionRaw))
		description = strings.Join(strings.Fields(description), " ")

		// Resolve Title
		title := getGameName(appID)

		recs = append(recs, SteamRecommendation{
			AppID:       appID,
			Title:       title,
			Image:       image,
			Playtime:    hours,
			Recommend:   recommend,
			Description: description,
		})
	}

	if len(recs) == 0 {
		return fallbackRecommendations
	}

	return recs
}

func main() {
	tmpl, err := template.ParseFS(templatesFS, "templates/index.html")
	if err != nil {
		log.Fatalf("failed to parse embedded templates: %v", err)
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		if err := tmpl.Execute(w, nil); err != nil {
			log.Printf("error executing template: %v", err)
		}
	})

	http.HandleFunc("/api/steam", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "public, max-age=300")
		recs := fetchSteamRecommendations()
		if err := json.NewEncoder(w).Encode(recs); err != nil {
			log.Printf("error encoding recs to json: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	http.Handle("/static/", http.FileServer(http.FS(staticFS)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
