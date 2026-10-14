# Assignment 9 (Weather forecast)

Источник: [скриншот задания](../../../sources/mobile/Screenshot 2026-09-18 at 14.11.03.png).

## Original assignment — English

Create a React Native Expo app that requests location permission from the user and retrieves the current location using the `expo-location` library. Display the city name based on the location using the geocoding feature of the `expo-location` library.

Then, the app fetches a 7-day local weather forecast from the Open-Meteo API (https://open-meteo.com/) using the coordinates obtained from the location. For each day, display the date, minimum temperature, and maximum temperature (use the temperature at 2 meters above ground level and Celsius as the unit).

Example UI:

На исходном скриншоте далее изображён пример интерфейса «Weather forecast», город Vantaa, семь карточек с датой, Min/Max и °C. Числа на картинке — демонстрационные, а не константы для программы.

## Что требуется

1. React Native + Expo.
2. Запросить foreground-доступ к геолокации.
3. Получить текущее местоположение через `expo-location`.
4. Использовать обратное геокодирование и вывести название города.
5. По полученным координатам вызвать Open-Meteo.
6. Показать ровно семь дней, дату, минимальную и максимальную температуру воздуха на высоте 2 м.
7. Единица измерения — градусы Цельсия.

Обработка отказа разрешения, ошибок сети, кнопка Refresh и сообщение об отсутствии города — дополнительные улучшения. Они не заменяют основное задание.

[Подробное решение](MANUAL.md) · [Код](../../../../../..)
