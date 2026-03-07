package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
	"go.uber.org/zap"

	"github.com/shopen/backend/internal/db"
	"github.com/shopen/backend/internal/handlers"
	"github.com/shopen/backend/internal/logger"
	"github.com/shopen/backend/internal/metrics"
	"github.com/shopen/backend/internal/middleware"
)

func main() {

	// ── INIT OBSERVABILITY ─────────────────────────────────────
	logger.Init()
	defer logger.Log.Sync()

	metrics.Init()

	logger.Log.Info("starting shopen api")

	// ── LOAD ENV ───────────────────────────────────────────────
	_ = godotenv.Load()

	// ── DATABASE CONNECTION ────────────────────────────────────
	database, err := db.New()
	if err != nil {
		logger.Log.Fatal("database connection failed",
			zap.Error(err),
		)
	}
	defer database.Close()

	logger.Log.Info("database connected")

	// ── HANDLERS ───────────────────────────────────────────────
	h := handlers.New(database)

	// ── ROUTER ─────────────────────────────────────────────────
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(logger.LoggingMiddleware)
	r.Use(middleware.MetricsMiddleware)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.CleanPath)

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", "https://shopen.app"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// ── ROUTES ─────────────────────────────────────────────────

	// Prometheus metrics
	r.Method(http.MethodGet, "/metrics", middleware.MetricsHandler())

	// Health
	r.Get("/api/health", h.HealthCheck)

	// Public routes
	r.Group(func(r chi.Router) {
		r.Get("/api/shops", h.ListShops)
		r.Get("/api/shops/{id}", h.GetShop)
	})

	// Auth
	r.Post("/api/auth/login", h.Login)

	// Admin routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.JWTAuth)

		r.Get("/api/admin/stats", h.GetStats)
		r.Get("/api/admin/shops", h.ListShops)
		r.Post("/api/admin/shops", h.CreateShop)
		r.Put("/api/admin/shops/{id}", h.UpdateShop)
		r.Delete("/api/admin/shops/{id}", h.DeleteShop)
		r.Patch("/api/admin/shops/{id}/toggle", h.ToggleShopStatus)
	})

	// ── SERVER START ───────────────────────────────────────────

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := fmt.Sprintf(":%s", port)

	logger.Log.Info("server ready",
		zap.String("address", addr),
		zap.String("env", os.Getenv("ENV")),
	)

	if err := http.ListenAndServe(addr, r); err != nil {
		logger.Log.Fatal("server failed",
			zap.Error(err),
		)
	}
}
