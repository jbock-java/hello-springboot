dev:
	cd src/main/client && npm run dev

run:
	cd src/main/client && npm run build
	./gradlew bootRun

build:
	cd src/main/client && npm run build
	./gradlew bootJar
