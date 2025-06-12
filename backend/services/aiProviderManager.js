// Advanced AI Provider Manager for Borouge ESG Intelligence Platform
// Intelligent load balancing, health monitoring, and failover management

const EventEmitter = require('events');

class AIProviderManager extends EventEmitter {
  constructor(config, supabase) {
    super();
    this.config = config;
    this.supabase = supabase;

    // Provider health tracking
    this.providerHealth = new Map();
    this.providerMetrics = new Map();
    this.circuitBreakers = new Map();
    this.rateLimitPrediction = new Map();

    // Initialize provider health
    this.initializeProviders();

    // Start health monitoring
    this.startHealthMonitoring();
  }

  // Initialize provider health tracking
  initializeProviders() {
    const providers = ['gemini', 'groq', 'openai']; // GEMINI FIRST - Superior ESG intelligence generation

    providers.forEach(provider => {
      this.providerHealth.set(provider, {
        status: 'healthy',
        lastCheck: Date.now(),
        consecutiveFailures: 0,
        responseTime: 0,
        qualityScore: 100,
        availability: 100
      });

      this.providerMetrics.set(provider, {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        qualityScores: [],
        averageQualityScore: 100,
        costPerRequest: this.getProviderCost(provider),
        totalCost: 0
      });

      this.circuitBreakers.set(provider, {
        state: 'closed', // closed, open, half-open
        failureCount: 0,
        lastFailureTime: 0,
        timeout: 60000, // 1 minute
        threshold: 5 // failures before opening
      });

      this.rateLimitPrediction.set(provider, {
        requestsInWindow: 0,
        windowStart: Date.now(),
        windowSize: 60000, // 1 minute
        predictedLimit: this.getProviderRateLimit(provider),
        safetyMargin: 0.8 // Use 80% of limit before switching
      });
    });

    console.log('🤖 AI Provider Manager initialized with health monitoring');
  }

  // Get provider cost per request (for optimization)
  getProviderCost(provider) {
    const costs = {
      gemini: 0.0001, // BEST VALUE - Superior ESG intelligence at low cost
      groq: 0.0005, // Higher effective cost due to poor quality (requires multiple calls)
      openai: 0.02 // Expensive - emergency use only
    };
    return costs[provider] || 0;
  }

  // Get provider rate limits
  getProviderRateLimit(provider) {
    const limits = {
      groq: this.config.groq.rateLimit || 100,
      gemini: this.config.gemini.rateLimit || 900,
      openai: 50 // Conservative limit for budget preservation
    };
    return limits[provider] || 100;
  }

  // ESG-SPECIFIC PROVIDER SELECTION - GEMINI PRIORITIZED FOR COMPREHENSIVE ANALYSIS
  selectProviderForESG(analysisType = 'comprehensive') {
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    // For ESG intelligence, ALWAYS prefer Gemini if available (proven 5000-6000 char responses)
    if (availableProviders.includes('gemini')) {
      console.log(`🎯 ESG Analysis: Selected GEMINI (proven superior: 5000-6000 chars vs Groq's 127-291 chars)`);
      return 'gemini';
    }

    // Fallback only if Gemini is unavailable
    if (availableProviders.includes('groq')) {
      console.log(`⚠️  ESG Analysis: Fallback to GROQ (Gemini unavailable - expect significantly reduced quality)`);
      return 'groq';
    }

    // Emergency fallback
    console.log(`🚨 ESG Analysis: Emergency fallback to OpenAI (both Gemini and Groq unavailable)`);
    return availableProviders[0];
  }

  // Intelligent provider selection based on multiple factors
  selectOptimalProvider(queryComplexity = 'medium', prioritizeSpeed = false) {
    const availableProviders = this.getAvailableProviders();

    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    // Score providers based on multiple criteria
    const providerScores = availableProviders.map(provider => {
      const health = this.providerHealth.get(provider);
      const metrics = this.providerMetrics.get(provider);
      const rateLimitStatus = this.getRateLimitStatus(provider);

      let score = 0;

      // Health score (40% weight)
      score += (health.availability / 100) * 40;

      // Response time score (30% weight)
      const responseTimeScore = prioritizeSpeed ?
        Math.max(0, 100 - (health.responseTime / 100)) : 50;
      score += (responseTimeScore / 100) * 30;

      // Quality score (20% weight)
      score += (health.qualityScore / 100) * 20;

      // Rate limit availability (10% weight)
      score += (rateLimitStatus.available / rateLimitStatus.total) * 10;

      // Cost optimization bonus for free tiers
      if (metrics.costPerRequest < 0.001) {
        score += 5; // Bonus for free tiers
      }

      // PRIORITIZE GEMINI FOR COMPREHENSIVE ESG ANALYSIS
      if (provider === 'gemini') {
        score += 50; // MASSIVE preference for Gemini - proven superior for ESG intelligence
      } else if (provider === 'groq') {
        score -= 20; // Significant penalty for Groq - produces inadequate analysis (127-291 chars vs 5000-6000 chars)
      } else if (provider === 'openai') {
        score -= 30; // Strong penalty for OpenAI - use only as emergency fallback
      }

      // ESG-specific complexity adjustments
      if (queryComplexity === 'high' && provider === 'gemini') {
        score += 15; // Extra bonus for complex ESG queries with Gemini
      } else if (queryComplexity === 'medium' && provider === 'gemini') {
        score += 10; // Medium bonus for standard ESG analysis with Gemini
      } else if (queryComplexity === 'low' && provider === 'groq') {
        score += 2; // Minimal bonus for simple health checks with Groq only
      }

      return { provider, score, health, metrics };
    });

    // Sort by score and return best provider
    providerScores.sort((a, b) => b.score - a.score);
    const selected = providerScores[0];

    console.log(`🎯 Selected provider: ${selected.provider} (score: ${selected.score.toFixed(2)})`);
    return selected.provider;
  }

  // Get available providers (not in circuit breaker open state)
  getAvailableProviders() {
    const providers = ['gemini', 'groq', 'openai']; // Prioritize Gemini first
    return providers.filter(provider => {
      const circuitBreaker = this.circuitBreakers.get(provider);
      const health = this.providerHealth.get(provider);

      // Check circuit breaker state
      if (circuitBreaker.state === 'open') {
        // Check if timeout has passed for half-open state
        if (Date.now() - circuitBreaker.lastFailureTime > circuitBreaker.timeout) {
          circuitBreaker.state = 'half-open';
          console.log(`🔄 Circuit breaker for ${provider} moved to half-open state`);
        } else {
          return false;
        }
      }

      // Check basic health
      return health.status !== 'critical';
    });
  }

  // Check rate limit status for provider
  getRateLimitStatus(provider) {
    const prediction = this.rateLimitPrediction.get(provider);
    const now = Date.now();

    // Reset window if needed
    if (now - prediction.windowStart > prediction.windowSize) {
      prediction.requestsInWindow = 0;
      prediction.windowStart = now;
    }

    const available = Math.max(0,
      (prediction.predictedLimit * prediction.safetyMargin) - prediction.requestsInWindow
    );

    return {
      available,
      total: prediction.predictedLimit,
      percentage: (available / prediction.predictedLimit) * 100
    };
  }

  // Record provider usage for rate limit prediction
  recordProviderUsage(provider) {
    const prediction = this.rateLimitPrediction.get(provider);
    prediction.requestsInWindow++;

    // Update metrics
    const metrics = this.providerMetrics.get(provider);
    metrics.totalRequests++;
  }

  // Record provider response for health monitoring
  recordProviderResponse(provider, success, responseTime, qualityScore = null) {
    const health = this.providerHealth.get(provider);
    const metrics = this.providerMetrics.get(provider);
    const circuitBreaker = this.circuitBreakers.get(provider);

    // Update metrics
    if (success) {
      metrics.successfulRequests++;
      health.consecutiveFailures = 0;

      // Update circuit breaker
      if (circuitBreaker.state === 'half-open') {
        circuitBreaker.state = 'closed';
        circuitBreaker.failureCount = 0;
        console.log(`✅ Circuit breaker for ${provider} closed - service recovered`);
      }
    } else {
      metrics.failedRequests++;
      health.consecutiveFailures++;

      // Update circuit breaker
      circuitBreaker.failureCount++;
      if (circuitBreaker.failureCount >= circuitBreaker.threshold) {
        circuitBreaker.state = 'open';
        circuitBreaker.lastFailureTime = Date.now();
        console.log(`🚫 Circuit breaker for ${provider} opened - too many failures`);
        this.emit('providerUnavailable', provider);
      }
    }

    // Update response time
    metrics.totalResponseTime += responseTime;
    metrics.averageResponseTime = metrics.totalResponseTime / metrics.totalRequests;
    health.responseTime = metrics.averageResponseTime;

    // Update quality score
    if (qualityScore !== null) {
      metrics.qualityScores.push(qualityScore);
      if (metrics.qualityScores.length > 100) {
        metrics.qualityScores.shift(); // Keep last 100 scores
      }
      metrics.averageQualityScore = metrics.qualityScores.reduce((a, b) => a + b, 0) / metrics.qualityScores.length;
      health.qualityScore = metrics.averageQualityScore;
    }

    // Update availability
    const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
    health.availability = successRate;

    // Update cost tracking
    metrics.totalCost += metrics.costPerRequest;

    // Update health status
    if (health.consecutiveFailures >= 3) {
      health.status = 'degraded';
    } else if (health.consecutiveFailures >= 5) {
      health.status = 'critical';
    } else {
      health.status = 'healthy';
    }

    health.lastCheck = Date.now();

    // Emit health change events
    this.emit('healthUpdate', provider, health);
  }

  // Start health monitoring background process
  startHealthMonitoring() {
    setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Check every 30 seconds

    console.log('💓 AI Provider health monitoring started');
  }

  // Perform health checks on all providers
  async performHealthChecks() {
    const providers = ['groq', 'gemini', 'openai'];

    for (const provider of providers) {
      try {
        await this.performProviderHealthCheck(provider);
      } catch (error) {
        console.error(`Health check failed for ${provider}:`, error.message);
      }
    }
  }

  // Perform health check on specific provider
  async performProviderHealthCheck(provider) {
    // This is a lightweight health check - we don't make actual API calls
    // Instead, we analyze recent performance metrics

    const health = this.providerHealth.get(provider);
    const metrics = this.providerMetrics.get(provider);
    const now = Date.now();

    // Check if provider has been inactive for too long
    if (now - health.lastCheck > 300000) { // 5 minutes
      health.status = 'unknown';
    }

    // Check if success rate is too low
    if (metrics.totalRequests > 10 && health.availability < 50) {
      health.status = 'critical';
    } else if (metrics.totalRequests > 5 && health.availability < 80) {
      health.status = 'degraded';
    }

    // Log health status
    console.log(`💓 ${provider}: ${health.status} (${health.availability.toFixed(1)}% availability, ${health.responseTime.toFixed(0)}ms avg)`);
  }

  // Get comprehensive provider statistics
  getProviderStatistics() {
    const stats = {};

    for (const [provider, health] of this.providerHealth.entries()) {
      const metrics = this.providerMetrics.get(provider);
      const circuitBreaker = this.circuitBreakers.get(provider);
      const rateLimitStatus = this.getRateLimitStatus(provider);

      stats[provider] = {
        health: {
          status: health.status,
          availability: health.availability,
          responseTime: health.responseTime,
          qualityScore: health.qualityScore,
          consecutiveFailures: health.consecutiveFailures,
          lastCheck: health.lastCheck
        },
        metrics: {
          totalRequests: metrics.totalRequests,
          successRate: metrics.totalRequests > 0 ?
            (metrics.successfulRequests / metrics.totalRequests * 100) : 0,
          averageResponseTime: metrics.averageResponseTime,
          averageQualityScore: metrics.averageQualityScore,
          totalCost: metrics.totalCost,
          costPerRequest: metrics.costPerRequest
        },
        circuitBreaker: {
          state: circuitBreaker.state,
          failureCount: circuitBreaker.failureCount
        },
        rateLimit: {
          available: rateLimitStatus.available,
          total: rateLimitStatus.total,
          percentage: rateLimitStatus.percentage
        }
      };
    }

    return stats;
  }

  // Get provider recommendations for optimization
  getOptimizationRecommendations() {
    const recommendations = [];
    const stats = this.getProviderStatistics();

    for (const [provider, data] of Object.entries(stats)) {
      // High cost recommendations
      if (data.metrics.totalCost > 1.0) {
        recommendations.push({
          type: 'cost',
          provider,
          message: `High API costs detected for ${provider}: $${data.metrics.totalCost.toFixed(4)}`,
          suggestion: 'Consider using free tier providers for non-critical queries'
        });
      }

      // Performance recommendations
      if (data.health.responseTime > 5000) {
        recommendations.push({
          type: 'performance',
          provider,
          message: `Slow response times for ${provider}: ${data.health.responseTime.toFixed(0)}ms`,
          suggestion: 'Consider deprioritizing this provider for time-sensitive queries'
        });
      }

      // Quality recommendations
      if (data.health.qualityScore < 70) {
        recommendations.push({
          type: 'quality',
          provider,
          message: `Low quality scores for ${provider}: ${data.health.qualityScore.toFixed(1)}`,
          suggestion: 'Review prompt engineering or consider alternative providers'
        });
      }

      // Availability recommendations
      if (data.health.availability < 90) {
        recommendations.push({
          type: 'availability',
          provider,
          message: `Low availability for ${provider}: ${data.health.availability.toFixed(1)}%`,
          suggestion: 'Investigate provider issues or increase circuit breaker threshold'
        });
      }
    }

    return recommendations;
  }

  // Reset provider statistics (for testing or maintenance)
  resetProviderStatistics(provider = null) {
    if (provider) {
      this.initializeProvider(provider);
      console.log(`📊 Statistics reset for provider: ${provider}`);
    } else {
      this.initializeProviders();
      console.log('📊 All provider statistics reset');
    }
  }

  // Get provider health summary for monitoring
  getHealthSummary() {
    const providers = Array.from(this.providerHealth.keys());
    const healthy = providers.filter(p => this.providerHealth.get(p).status === 'healthy').length;
    const degraded = providers.filter(p => this.providerHealth.get(p).status === 'degraded').length;
    const critical = providers.filter(p => this.providerHealth.get(p).status === 'critical').length;

    return {
      total: providers.length,
      healthy,
      degraded,
      critical,
      overallStatus: critical > 0 ? 'critical' : degraded > 0 ? 'degraded' : 'healthy'
    };
  }
}

module.exports = AIProviderManager;
