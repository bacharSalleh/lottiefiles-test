export class CacheService {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  async add(key: string, response: Response) {
    const cache = await caches.open(this.name);
    await cache.put(key, response.clone());
  }

  async get(key: string) {
    const cache = await caches.open(this.name);
    return await cache.match(key);
  }
}
