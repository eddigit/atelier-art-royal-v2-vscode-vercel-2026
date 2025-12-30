/**
 * Cache en mémoire simple pour optimiser les requêtes répétitives
 * Utilisé pour les menus dynamiques, filtres, etc.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;

  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Récupérer une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Vérifier si l'entrée est expirée
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Stocker une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl = 300000): void { // TTL par défaut: 5 minutes
    // Si le cache est plein, supprimer l'entrée la plus ancienne
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalider une entrée du cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalider toutes les entrées correspondant à un pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Vider tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Méthode helper pour get-or-fetch pattern
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl = 300000
  ): Promise<T> {
    // Essayer de récupérer du cache
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Sinon, récupérer depuis la source et mettre en cache
    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }
}

// Instance singleton du cache
export const catalogCache = new SimpleCache(200); // Cache pour 200 entrées max

// Clés de cache prédéfinies
export const CACHE_KEYS = {
  MENU_CATEGORIES: 'menu:categories',
  MENU_RITES: 'menu:rites',
  MENU_OBEDIENCES: 'menu:obediences',
  MENU_DEGREES: 'menu:degrees',
  FILTERS_AGGREGATIONS: 'filters:aggregations',
  PRODUCT_COUNTS: 'product:counts',
};

// TTL prédéfinis (en millisecondes)
export const CACHE_TTL = {
  SHORT: 60000, // 1 minute
  MEDIUM: 300000, // 5 minutes
  LONG: 900000, // 15 minutes
  HOUR: 3600000, // 1 heure
};

/**
 * Invalider le cache lié aux produits (à appeler lors de modifications)
 */
export function invalidateProductCache() {
  catalogCache.invalidatePattern('^(menu|filters|product):');
}

/**
 * Invalider le cache d'une entité spécifique
 */
export function invalidateEntityCache(entity: 'category' | 'rite' | 'obedience' | 'degree' | 'product') {
  catalogCache.invalidatePattern(`^(menu|filters):.*${entity}`);
}

export default catalogCache;
