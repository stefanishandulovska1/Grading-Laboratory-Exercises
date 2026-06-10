.PHONY: build up down logs clean backup restore

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	docker system prune -f

backup:
	./backup.sh

restore:
	./restore.sh $(TIMESTAMP)

dev:
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up

prod:
	docker-compose up -d

status:
	docker-compose ps

restart:
	docker-compose restart

update:
	git pull origin main
	docker-compose build --no-cache
	docker-compose up -d