package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

//go:embed templates/*
var templatesFS embed.FS

type SteamGame struct {
	AppID    string `json:"appId"`
	Title    string `json:"title"`
	Image    string `json:"image"`
	Playtime string `json:"playtime"`
	Status   string `json:"status"`
}

var fallbackGames = []SteamGame{
	{
		AppID:    "3678970",
		Title:    "TBH: Task Bar Hero",
		Image:    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3678970/124cbad7c55f19814d0b8f019e06e5a50b8c6337/capsule_184x69.jpg?t=1780512075",
		Playtime: "37 hrs on record",
		Status:   "Currently In-Game",
	},
	{
		AppID:    "570",
		Title:    "Dota 2",
		Image:    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/capsule_184x69.jpg?t=1769535998",
		Playtime: "4,342 hrs on record",
		Status:   "last played on Jun 11, 2026",
	},
	{
		AppID:    "3002570",
		Title:    "Nymphomaniac - Sex Addict",
		Image:    "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3002570/capsule_184x69.jpg?t=1778660583",
		Playtime: "57 hrs on record",
		Status:   "last played on May 24, 2026",
	},
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

func fetchSteamGames() []SteamGame {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}

	resp, err := client.Get("https://steamcommunity.com/id/mz_ganteng")
	if err != nil {
		log.Printf("error fetching steam profile: %v, using fallback", err)
		return fallbackGames
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("steam returned status %d, using fallback", resp.StatusCode)
		return fallbackGames
	}

	body, err := io.ReadAll(io.LimitReader(resp.Body, 1024*1024))
	if err != nil {
		log.Printf("error reading steam response: %v, using fallback", err)
		return fallbackGames
	}

	html := string(body)
	startIndex := strings.Index(html, "<div class=\"recent_games\">")
	if startIndex == -1 {
		log.Printf("could not find recent_games container, using fallback")
		return fallbackGames
	}

	block := html[startIndex:]
	gameBlocks := strings.Split(block, "<div class=\"recent_game\">")
	if len(gameBlocks) <= 1 {
		log.Printf("found no individual recent_game items, using fallback")
		return fallbackGames
	}

	var games []SteamGame
	for i := 1; i < len(gameBlocks); i++ {
		gBlock := gameBlocks[i]

		// Check if we hit right column or have enough games
		if len(games) >= 3 || strings.Contains(gBlock, "profile_rightcol") {
			break
		}

		appID := extractBetween(gBlock, "https://steamcommunity.com/app/", "\"")
		if appID == "" {
			continue
		}

		image := extractBetween(gBlock, "class=\"game_capsule\" src=\"", "\"")
		
		gameNameBlock := extractBetween(gBlock, "class=\"game_name\"", "</div>")
		title := extractBetween(gameNameBlock, ">", "</a>")
		title = strings.TrimSpace(title)

		detailsRaw := extractBetween(gBlock, "class=\"game_info_details\">", "</div>")
		detailsRaw = strings.ReplaceAll(detailsRaw, "<br>", "\n")
		detailsRaw = strings.ReplaceAll(detailsRaw, "<br/>", "\n")
		detailsRaw = strings.ReplaceAll(detailsRaw, "<br />", "\n")

		var detailsClean strings.Builder
		inTag := false
		for _, r := range detailsRaw {
			if r == '<' {
				inTag = true
			} else if r == '>' {
				inTag = false
			} else if !inTag {
				detailsClean.WriteRune(r)
			}
		}

		lines := strings.Split(detailsClean.String(), "\n")
		var playtime, status string
		if len(lines) > 0 {
			playtime = strings.TrimSpace(lines[0])
		}
		if len(lines) > 1 {
			status = strings.TrimSpace(lines[1])
		}

		playtime = strings.Join(strings.Fields(playtime), " ")
		status = strings.Join(strings.Fields(status), " ")

		games = append(games, SteamGame{
			AppID:    appID,
			Title:    title,
			Image:    image,
			Playtime: playtime,
			Status:   status,
		})
	}

	if len(games) == 0 {
		return fallbackGames
	}

	return games
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
		w.Header().Set("Content-Type", "application/json")
		games := fetchSteamGames()
		if err := json.NewEncoder(w).Encode(games); err != nil {
			log.Printf("error encoding games to json: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
