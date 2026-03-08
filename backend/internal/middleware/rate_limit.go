package middleware

import (
	"net/http"
	"time"

	"github.com/shopen/backend/internal/cache"
)

const (
	requestLimit = 100
	window       = time.Minute
)

func RateLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		ip := r.RemoteAddr

		key := "rate_limit:" + ip

		count, err := cache.Client.Incr(cache.Ctx, key).Result()

		if err != nil {
			http.Error(w, "rate limiter error", http.StatusInternalServerError)
			return
		}

		if count == 1 {
			cache.Client.Expire(cache.Ctx, key, window)
		}

		if count > requestLimit {
			http.Error(w, "too many requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}
