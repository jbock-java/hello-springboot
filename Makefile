install:
	cd src/main/client && npm install

dev:
	cd src/main/client && npm run dev

pack:
	cd src/main/client && npm run build

lint:
	cd src/main/client && npm run lint

run:
	./gradlew bootRun

show: pack
	./gradlew clean bootRun

build: pack
	./gradlew bootJar
