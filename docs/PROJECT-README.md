# 09 · Weather forecast

Разрешение геолокации → текущие координаты → город через expo-location → Open-Meteo → семь дат с minimum/maximum 2 m в °C.

- [Исходное задание](materials/homework-2026-09-20/docs/mobile/09-weather-forecast/assignment-original.md)
- [Полная инструкция, теория, листинги, проверки](materials/homework-2026-09-20/docs/mobile/09-weather-forecast/MANUAL.md)

Это Expo TypeScript, запуск на телефоне/нативном симуляторе, не Vite и не обычная web-страница.

Если взят весь комплект: `cd projects/mobile && npm ci`, затем `cd 09-weather-forecast`.
Если скопирована только эта папка: `npm install` (создаст локальный lock).

```bash
npm run typecheck
npm test
npm start
```

Для Android/iOS bundle: npm run bundle:android / npm run bundle:ios. Это не APK/IPA.
