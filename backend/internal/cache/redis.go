package cache

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/redis/go-redis/extra/redisotel/v9"
	"github.com/redis/go-redis/v9"
)

var Client *redis.Client
var Ctx = context.Background()

func Init() {

	addr := os.Getenv("REDIS_ADDR")
	if addr == "" {
		addr = "localhost:6379"
	}

	Client = redis.NewClient(&redis.Options{
		Addr: addr,

		PoolSize:     20,
		MinIdleConns: 5,
		MaxRetries:   3,

		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,

		PoolTimeout:     4 * time.Second,
		ConnMaxIdleTime: 5 * time.Minute,
	})

	// Enable OpenTelemetry tracing (Jaeger)
	if err := redisotel.InstrumentTracing(Client); err != nil {
		log.Fatalf("redis tracing error: %v", err)
	}

	// Enable OpenTelemetry metrics (Prometheus)
	if err := redisotel.InstrumentMetrics(Client); err != nil {
		log.Fatalf("redis metrics error: %v", err)
	}

	// Retry connection (important for Docker startup)
	var err error

	for i := 1; i <= 10; i++ {

		_, err = Client.Ping(Ctx).Result()

		if err == nil {
			log.Println("✅ Connected to Redis")
			return
		}

		log.Printf("⏳ Redis not ready (attempt %d/10)...", i)

		time.Sleep(2 * time.Second)
	}

	log.Fatalf("❌ Redis connection failed: %v", err)
}
