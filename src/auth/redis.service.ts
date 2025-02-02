// import { Injectable } from '@nestjs/common';
// import { RedisService } from '@webeleon/nestjs-redis';  // Импортируем из правильного пакета
//
// @Injectable()
// export class RedisService {
//   constructor(private readonly redis: Redis) {}
//
//   // Метод для получения значения по ключу
//   async get(key: string): Promise<string | null> {
//     return this.redis.get(key);
//   }
//
//   // Метод для сохранения значения в Redis
//   async setEx(key: string, value: string, expireTime: number) {
//     return this.redis.setEx(key, expireTime, value);
//   }
//
//   // Метод для удаления ключа из Redis
//   async del(key: string) {
//     return this.redis.del(key);
//   }
// }
