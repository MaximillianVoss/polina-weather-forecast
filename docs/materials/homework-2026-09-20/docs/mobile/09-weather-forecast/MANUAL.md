# 09 · Weather forecast: от начала до сдачи

[Исходное задание целиком](assignment-original.md) · [Папка готового проекта](../../../../../..)

## 1. Требования и результат

Разрешение геолокации → текущие координаты → город через expo-location → Open-Meteo → семь дат с minimum/maximum 2 m в °C.

Вверху название фактического города, ниже семь дней погоды. Даты приходят с сервера в часовом поясе места, а не задаются вручную. Отказ в доступе и ошибки сети видны на экране.

Маршрут: сверить условие → открыть/создать Expo TypeScript → восстановить файлы → установить зависимости → проверить типы и логику → запустить на устройстве → пройти ручные сценарии → подготовить сдачу.

## 2. Минимум теории

Прямое геокодирование: адрес → координаты. Обратное: координаты → адрес/город. Для погоды нужны именно текущие координаты, поэтому getCurrentPositionAsync идёт до запроса API. async/await описывает асинхронные шаги последовательно; await не блокирует весь интерфейс. useEffect запускает первоначальную загрузку после монтирования, useRef хранит флаг занятости между рендерами.

Запрос отправляет координаты Open-Meteo; приложение не хранит историю перемещений и не использует фоновые разрешения. daily=temperature_2m_min,temperature_2m_max выбирает минимум/максимум на высоте 2 м; timezone=auto и forecast_days=7 задаются явно. Если городской геокодер не нашёл имя, показаны координаты и предупреждение, а не выдуманный город. Документация: [Open-Meteo](https://open-meteo.com/en/docs), [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/).

## 3. Среда и первый запуск на Mac

Используется согласованная связка Expo SDK 57, React 19.2.3, React Native 0.86.3, TypeScript 6.0.3; точные разрешённые версии зависимостей зафиксированы общим package-lock.json в projects/mobile. Node 24 выбран для одинакового запуска тестов, включая node:sqlite. Случайно обновлять один react-native отдельно от Expo не нужно.

Проверьте:

```bash
node --version
npm --version
# Если NVM уже установлен:
nvm install 24
nvm use 24
```

Нужен Expo Go, совместимый с SDK 57, на телефоне либо iOS Simulator (Xcode, только macOS) / Android Emulator (Android Studio). Компьютер и телефон должны видеть друг друга по сети. Готовые примеры намеренно настроены только на ios/android: браузер не является проверкой карты, GPS, SQLite и RN-персистентности Auth.

### Вариант A — весь комплект

Откройте терминал в корне нового комплекта. У всех четырёх проектов один workspace-lock, поэтому npm ci выполняется в projects/mobile:

```bash
cd projects/mobile
npm ci
cd 09-weather-forecast
npm run typecheck
npm test
npm start
```

Отсканируйте QR в Expo Go. Для уже настроенного симулятора можно вместо последней команды выполнить npm run ios или npm run android. Не запускайте npm start одновременно в нескольких терминалах для одного проекта.

### Вариант B — только одна папка проекта

Скопируйте целиком projects/mobile/09-weather-forecast в отдельный учебный каталог, откройте терминал внутри неё и выполните:

```bash
npm install
npm run typecheck
npm test
npm start
```

При отдельном копировании общего lock-файла нет: сначала npm install создаёт собственный package-lock.json. Команда npm ci допустима только после этого. Если уже работали в Classroom-репозитории, сначала сохраните свой исходный вариант; не заменяйте его файлы вслепую.

### Вариант C — восстановить с нуля вручную

[create-expo-app](https://docs.expo.dev/more/create-expo/) поддерживает blank-typescript и --no-install. Создавайте в новой пустой папке, не внутри существующего проекта:

```bash
npx create-expo-app@latest 09-weather-forecast --template blank-typescript --no-install
cd 09-weather-forecast
```

Затем замените package.json, app.json, tsconfig.json, index.ts и App.tsx полными версиями ниже, добавьте src/ и tests/, после чего npm install. Версии готового package.json возвращают пример к проверенной связке SDK57 даже если текущий шаблон уже обновился. Не переносите node_modules с Windows на Mac.

## 4. Реализация по этапам

### Этап 1. Каркас

Восстановите корневые файлы, index.ts, App.tsx и src/styles.ts по листингам. Здесь используется пустой Expo TypeScript, без Router и HTML.

### Этап 2. Модель ответа

Создайте src/weather.ts. ForecastDay содержит date, min, max. null означает, что температура отсутствует в ответе: это не ноль градусов.

### Этап 3. URL и проверка JSON

forecastUrl строит URLSearchParams по полученным координатам. parseForecast принимает unknown и проверяет структуру, единицы °C, семь элементов в каждом массиве, числа или null, минимум не больше максимума. Интерфейс TypeScript сам по себе НЕ проверяет данные из интернета.

### Этап 4. Разрешение и город

refresh запрашивает foreground-доступ и проверяет включённые Location Services. Затем получает позицию и вызывает reverseGeocodeAsync. city — первый выбор; district/subregion помогают, если город у провайдера пуст.

### Этап 5. Погода

loadForecast делает fetch, проверяет HTTP status, передаёт JSON валидатору и имеет сетевой таймаут 20 секунд через AbortController. Этот таймаут относится к запросу погоды, не к ожиданию GPS.

### Этап 6. Экран

FlatList рисует ForecastDay. В качестве key используется дата, а не индекс. Начальная загрузка запускается useEffect; Refresh запускает тот же обработчик. Alive-флаг предотвращает обновление состояния после размонтирования.

### Этап 7. Проверка и объяснение

Покажите преподавателю реальное разрешение, текущий город и семь карточек. Объясните разницу между координатами GPS и строкой города; отключите сеть и повторите загрузку.

## 5. Что использовано и почему

| Функция / приём | Что делает | Почему здесь |
|---|---|---|
| requestForegroundPermissionsAsync | Запрашивает разрешение только на время использования. | Фоновые разрешения заданию не нужны. |
| getCurrentPositionAsync | Читает текущую позицию с Balanced accuracy. | Для прогноза по городу сверхточный GPS не нужен. |
| reverseGeocodeAsync | Получает название места по координатам. | Город не задан константой. |
| forecastUrl | Строит параметры запроса к Open-Meteo. | Явные единицы и количество дней устраняют неоднозначность. |
| parseForecast | Проверяет реальные данные unknown. | Типизация не заменяет runtime-валидацию. |
| loadForecast | fetch + HTTP check + AbortController. | Сетевую ошибку нужно отличать от корректного JSON. |
| temperature | Форматирует число или «not available». | null не превращается в ложные 0 °C. |
| busy / alive useRef | Не допускают параллельных обновлений и записи state после unmount. | Состояние запроса сохраняется независимо от перерисовки. |

Общие элементы: useState изменяет отображаемые данные; типы TypeScript обнаруживают несоответствия до запуска; SafeAreaView защищает содержимое от выреза экрана; StyleSheet.create описывает нативные стили; disabled не даёт отправить повторную операцию во время обработки. Promise возвращает будущий результат, поэтому нажатия вызывают void handler(), а ошибки обрабатываются внутри async-функции.

## 6. Проверка и ручные сценарии

```bash
npm run typecheck
npm test
npm run bundle:android
npm run bundle:ios
```

Экспорт создаёт JavaScript/Hermes bundle, **не APK/IPA и не готовую установку**. Он подтверждает совместимость импортов и сборки, но не работу физических датчиков/сервиса на телефоне.

4 модульных теста URL/структуры/единиц/ошибок. Дополнительно 20.09.2026 loadForecast проверен настоящим HTTP-запросом для публичных координат Helsinki 60.1699,24.9384: получены 7 дней, 20–26.09.2026. Это проверка API-клиента, а не GPS телефона.

| Сценарий | Ожидаемый результат |
|---|---|
| Первый запуск, доступ разрешён | Появляются город и семь карточек. |
| Отказ в разрешении | Понятная ошибка и Open settings; прогноз не выдаётся за реальный. |
| Отключён GPS | Сообщение Turn on device Location Services. |
| Смена позиции симулятора и Refresh | Прогноз запрашивается для новых координат. |
| Нет сети | Ошибка запроса/таймаут, кнопка снова доступна. |
| Город не определён | Координаты и предупреждение; данные погоды всё ещё по текущему месту. |
| Температура равна нулю / null | 0.0 °C и not available различаются. |

## 7. Частые ошибки

Если GPS долго ищет позицию: на телефоне включите Location Services, в симуляторе задайте location через его меню. На компьютере браузерная геолокация не заменяет проверку reverseGeocodeAsync в React Native. Неверный часовой пояс не исправляйте ручным сдвигом дат — запрос уже использует timezone=auto. Даты показаны ISO-строками, поэтому локальный парсер Date не сдвигает их на предыдущий день.

Если «react/jsx-runtime not found»: убедитесь, что терминал открыт в нужном проекте, выполните установку зависимостей, выберите workspace TypeScript в редакторе и перезапустите TS Server. Если JSX содержит незакрытый тег — установка зависимостей это не исправит; сравните файл с полным листингом. Если Metro показывает старый вариант, остановите его Ctrl+C и выполните npm start -- --clear. Обычный Expo при Ctrl+C останавливает сервер, а не удаляет проект; старые скрипты создания здесь не используются.

## 8. Что показать при сдаче

1. Прочитать своё исходное условие и перечислить обязательные пункты.
2. Показать реальные исходники и объяснить поток данных по таблице выше.
3. Выполнить typecheck и тесты; не называть их телефонной проверкой.
4. Продемонстрировать основной сценарий и хотя бы одну обработанную ошибку на устройстве.
5. В репозиторий/архив включить исходники, конфигурацию и свой lock-файл, но не node_modules, .expo, dist и .env. Действия публикации/отправки выполняет сам ученик по правилам курса.

## 9. Полные авторские файлы

Далее приведено полное содержимое, без многоточий. package-lock.json не перепечатан: это автоматически сгенерированный файл фиксации зависимостей. Весь необходимый авторский код, конфигурация и тесты перечислены.

### package.json

```json
{
  "name": "homework-09-weather-forecast",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "typecheck": "tsc --noEmit",
    "test": "node --experimental-strip-types --test tests/*.test.ts",
    "bundle:android": "expo export --platform android --output-dir dist-android",
    "bundle:ios": "expo export --platform ios --output-dir dist-ios"
  },
  "dependencies": {
    "expo": "~57.0.24",
    "react": "19.2.3",
    "react-native": "0.86.3",
    "react-native-safe-area-context": "~5.7.0",
    "expo-location": "~57.0.19"
  },
  "devDependencies": {
    "@types/react": "~19.2.2",
    "typescript": "~6.0.3"
  },
  "engines": {
    "node": ">=24 <25"
  }
}
```

### app.json

```json
{
  "expo": {
    "name": "Weather forecast",
    "slug": "homework-09-weather-forecast",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "platforms": [
      "ios",
      "android"
    ],
    "plugins": [
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Allow this homework app to use your location while it is open."
        }
      ]
    ]
  }
}
```

### tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "customConditions": [
      "react-native"
    ],
    "allowImportingTsExtensions": true
  },
  "include": [
    "App.tsx",
    "index.ts",
    "src/**/*.ts",
    "src/**/*.tsx"
  ]
}
```

### index.ts

```ts
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

### App.tsx

```tsx
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Linking, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { loadForecast, temperature, type ForecastDay } from './src/weather';
import { styles } from './src/styles';

export default function App() {
  const [city, setCity] = useState('');
  const [days, setDays] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const busy = useRef(false);
  const alive = useRef(true);

  async function refresh() {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    setNotice('');
    setDays([]);
    setCity('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error('Location permission denied. Enable it in Settings, then retry.');
      if (!await Location.hasServicesEnabledAsync()) throw new Error('Turn on device Location Services, then retry.');
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      let locationName = latitude.toFixed(3) + ', ' + longitude.toFixed(3);
      let locationNotice = '';
      try {
        const places = await Location.reverseGeocodeAsync({ latitude, longitude });
        const place = places[0];
        const name = place?.city ?? place?.district ?? place?.subregion;
        if (name) locationName = name;
        else locationNotice = 'City name is unavailable; coordinates are shown.';
      } catch {
        locationNotice = 'City lookup failed; the forecast still uses your actual location.';
      }
      const forecast = await loadForecast(latitude, longitude);
      if (!alive.current) return;
      setCity(locationName);
      setNotice(locationNotice);
      setDays(forecast);
    } catch (cause) {
      if (alive.current) {
        setError(cause instanceof Error ? cause.message : 'Could not load weather. Check network and try again.');
      }
    } finally {
      busy.current = false;
      if (alive.current) setLoading(false);
    }
  }

  useEffect(() => {
    alive.current = true;
    void refresh();
    return () => { alive.current = false; };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.title}>Weather forecast</Text>
          <Text style={styles.hint}>{city || 'Your current location'}</Text>
          <Button title={loading ? 'Loading…' : 'Refresh'} disabled={loading}
            onPress={() => { void refresh(); }} />
          {loading && <ActivityIndicator accessibilityLabel="Loading weather" />}
          {error !== '' && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          {error !== '' && <Button title="Open settings" onPress={() => { void Linking.openSettings(); }} />}
          {notice !== '' && <Text style={styles.hint}>{notice}</Text>}
          <FlatList
            data={days}
            keyExtractor={(day) => day.date}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.strong}>{item.date}</Text>
                <Text style={styles.label}>Min: {temperature(item.min)} / Max: {temperature(item.max)}</Text>
              </View>
            )}
          />
          <Text style={styles.hint}>7 days · air temperature at 2 m · Open-Meteo</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
```

### .gitignore

```text
node_modules/
.expo/
dist*/
.env
.env.*
!.env.example
.DS_Store
```

### .nvmrc

```text
24
```

### src/styles.ts

```ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f7fb' },
  content: { padding: 20, gap: 14, flex: 1 },
  title: { fontSize: 26, fontWeight: '700', color: '#14243b' },
  hint: { fontSize: 14, color: '#475569', lineHeight: 21 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#8a9cb4', borderRadius: 8, padding: 12, fontSize: 17 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 10, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { fontSize: 17, color: '#14243b', flexShrink: 1 },
  strong: { fontSize: 17, fontWeight: '700', color: '#14243b' },
  error: { color: '#a21b24', fontSize: 15, lineHeight: 21 },
  link: { color: '#1256aa', fontSize: 17, padding: 10 },
  map: { flex: 1, minHeight: 250, borderRadius: 12 },
});
```

### src/weather.ts

```ts
export type ForecastDay = { date: string; min: number | null; max: number | null };

export function forecastUrl(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('Invalid location coordinates.');
  }
  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: 'temperature_2m_min,temperature_2m_max',
    temperature_unit: 'celsius',
    timezone: 'auto',
    forecast_days: '7',
  });
  return 'https://api.open-meteo.com/v1/forecast?' + query.toString();
}

function object(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('The forecast service returned an invalid response.');
  }
  return value as Record<string, unknown>;
}

export function parseForecast(value: unknown): ForecastDay[] {
  const response = object(value);
  const daily = object(response.daily);
  const units = object(response.daily_units);
  if (units.temperature_2m_min !== '°C' || units.temperature_2m_max !== '°C') {
    throw new Error('The forecast temperatures are not in Celsius.');
  }
  const dates = daily.time;
  const minimums = daily.temperature_2m_min;
  const maximums = daily.temperature_2m_max;
  if (!Array.isArray(dates) || !Array.isArray(minimums) || !Array.isArray(maximums) ||
      dates.length !== 7 || minimums.length !== 7 || maximums.length !== 7) {
    throw new Error('The service did not return a complete 7-day forecast.');
  }
  return dates.map((date: unknown, index) => {
    const min: unknown = minimums[index];
    const max: unknown = maximums[index];
    const valid = (temperature: unknown): temperature is number | null =>
      temperature === null || (typeof temperature === 'number' && Number.isFinite(temperature));
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !valid(min) || !valid(max) || (min !== null && max !== null && min > max)) {
      throw new Error('The service returned an invalid forecast day.');
    }
    return { date, min, max };
  });
}

export async function loadForecast(latitude: number, longitude: number): Promise<ForecastDay[]> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 20000);
  try {
    const response = await fetch(forecastUrl(latitude, longitude), { signal: abort.signal });
    if (!response.ok) throw new Error('Weather request failed (HTTP ' + response.status + ').');
    return parseForecast(await response.json());
  } finally {
    clearTimeout(timer);
  }
}

export function temperature(value: number | null): string {
  return value === null ? 'not available' : value.toFixed(1) + ' °C';
}
```

### tests/weather.test.ts

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { forecastUrl, parseForecast, temperature } from '../src/weather.ts';

function sample() {
  return { daily_units: { temperature_2m_min: '°C', temperature_2m_max: '°C' },
    daily: { time: Array.from({ length: 7 }, (_, i) => '2026-09-' + (20 + i)),
      temperature_2m_min: [-2, 0, 3, 4, 5, 6, null],
      temperature_2m_max: [4, 6, 10, 11, 12, 13, null] } };
}
test('requests 7 daily 2m temperatures in Celsius for the device location', () => {
  const url = new URL(forecastUrl(60.2, 24.9));
  assert.equal(url.searchParams.get('forecast_days'), '7');
  assert.equal(url.searchParams.get('latitude'), '60.2');
  assert.equal(url.searchParams.get('daily'), 'temperature_2m_min,temperature_2m_max');
  assert.equal(url.searchParams.get('temperature_unit'), 'celsius');
  assert.equal(url.searchParams.get('timezone'), 'auto');
});
test('parses 7 days and preserves missing temperatures as null', () => {
  const days = parseForecast(sample());
  assert.equal(days.length, 7);
  assert.deepEqual(days[0], { date: '2026-09-20', min: -2, max: 4 });
  assert.equal(days[6]?.min, null);
  assert.equal(temperature(null), 'not available');
});
test('rejects invalid coordinates and incomplete payloads', () => {
  assert.throws(() => forecastUrl(91, 0));
  assert.throws(() => parseForecast({}));
  const value = sample();
  value.daily.time.pop();
  assert.throws(() => parseForecast(value));
});
test('rejects wrong units and malformed temperature values', () => {
  const value = sample();
  value.daily_units.temperature_2m_min = '°F';
  assert.throws(() => parseForecast(value));
  const reversed = sample();
  reversed.daily.temperature_2m_min[0] = 999;
  assert.throws(() => parseForecast(reversed));
});
```
