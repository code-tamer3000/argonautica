# Argonautica — деплой сайта

Этот файл — единственный источник правды про деплой. Если он расходится с чем-то
в `.github/workflows/` или скриптами в `site/` — правь код под этот файл, а не наоборот.

## Как задеплоить

Деплой полностью автоматический через GitHub Actions (`.github/workflows/deploy.yml`),
триггер — push с изменениями в `site/**`:

- push в `main` → собирается `site` и заливается на **боевой сайт**
  (`argonautica-systems.ru`).
- push в `develop` → собирается `site` и заливается на **превью**
  (`preview.argonautica-systems.ru`).
- любые другие ветки (feature/*) деплой не триггерят. Чтобы увидеть фичу на превью —
  смержь её в `develop`.

Ручной запуск — `workflow_dispatch` в GitHub Actions (кнопка Run workflow), деплоит
ту ветку, из которой запущен.

Никаких локальных deploy-скриптов больше нет (`site/deploy.sh`, `site/deploy_test.sh`
были на старый сервер beget и не работают — удалены). Не создавай их заново — вся
логика деплоя живёт в одном workflow-файле.

## Топология сервера (общая для platform и сайта)

Один хост: `45.151.102.255` (домены — A-записи на этот IP). На нём несколько
независимых docker-compose проектов, разделённых по `-p <project>`, с единственной
общей точкой входа — прод-nginx платформы, который слушает `:80`/`:443` (TCP) и
`:443/udp` (HTTP/3) и проксирует по `server_name`/SNI на нужный контейнер.

| Домен | Кто отдаёт | Compose-проект | Репозиторий |
|---|---|---|---|
| `platform.argonautica-systems.ru` | платформа (backend/frontend) | `docker` (`/opt/platform`) | platform |
| `staging.argonautica-systems.ru` | тестовый стенд платформы | `platform-staging` (`/opt/platform-staging`) | platform |
| `metrics.<домен>` | Grafana | `docker` (observability compose) | platform |
| `argonautica-systems.ru` + `www` | маркетинговая визитка (этот репо) | `argonautica-site` | сайт |
| `preview.argonautica-systems.ru` | превью визитки | `argonautica-site-preview` | сайт |

Порты 80/443/443-udp на хосте владеет **только** прод-nginx платформы. У визитки и
превью нет собственных опубликованных портов — маршрутизацию и TLS делает прод-nginx
через внешнюю docker-сеть `gateway`.

## Где физически живёт сайт

- Контент прод-визитки: `/root/argonautica-site` на сервере — просто директория со
  статикой, смонтированная read-only в контейнер.
- Контент превью: `/root/argonautica-site-preview` (тот же паттерн).
- Отдающий контейнер — `nginx:alpine` без своего билда и **без PHP-FPM** (сайт
  полностью статический; PHP-файлы вроде `send.php`/`poll.php` в билде — мёртвый
  груз, не выполняются). Конфиг nginx и compose-файлы физически лежат в репозитории
  `platform` (`docker/argonautica-site*.compose.yml`), не в этом репо — трогать их
  отсюда незачем, они уже настроены.

## Что делает деплой сайта — и только это

```
rsync -az --delete <build-output>/ root@45.151.102.255:/root/argonautica-site/
```

(для превью — то же самое в `/root/argonautica-site-preview/`). Контент отдаётся
напрямую с диска (`try_files`), контейнер его не кэширует и не требует рестарта —
новые файлы подхватываются на следующий запрос.

## Чего деплой сайта делать НЕ должен никогда

- Публиковать какие-либо порты на хосте (80, 443, 443/udp — чужие, платформы).
- Запускать `docker compose` без явного `-p argonautica-site` / `-p argonautica-site-preview`.
- Трогать проекты `docker` (платформа) и `platform-staging` — restart/recreate/down
  чего угодно оттуда.
- Трогать `docker/nginx/**` в репозитории `platform` (TLS-терминация, маршрутизация
  по доменам) — это чужая зона, изменения требуют правки в репо `platform` и
  `--force-recreate` прод-nginx.
- `docker network rm gateway` / `docker network prune` / `docker system prune` — сеть
  `gateway` общая для платформы, стенда и визитки.
- Тяжёлые билд-шаги на самом сервере — он маломощный (2 ГБ RAM без свопа, диск почти
  забит). Билдить в CI, на сервер лить только готовый `dist/`.

## Разовые операции (не часть обычного деплоя)

Если контейнер визитки/превью не поднят (первый деплой на новом сервере, случайно упал):

```bash
cd /opt/platform
docker compose -p argonautica-site -f docker/argonautica-site.compose.yml up -d
# или для превью:
docker compose -p argonautica-site-preview -f docker/argonautica-site-preview.compose.yml up -d
```

Требует, чтобы сеть `gateway` уже существовала (`docker network create gateway` —
создаётся один раз вручную, обычно уже есть).

Если сайту нужен новый домен/сертификат — это не в его власти: маршрутизация по
домену и сертификат прописаны в шаблоне прод-nginx в репозитории `platform`. Такое
изменение = запрос в сторону репо `platform`, не самостоятельная правка отсюда.
