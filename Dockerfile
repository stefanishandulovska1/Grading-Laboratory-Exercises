FROM openjdk:17-jdk-slim

WORKDIR /app


COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x ./mvnw
RUN ./mvnw dependency:go-offline -B


COPY src src


RUN ./mvnw clean package -DskipTests


RUN cp target/*.jar app.jar


EXPOSE 8080


RUN mkdir -p /app/uploads


ENTRYPOINT ["java", "-jar", "/app/app.jar"]