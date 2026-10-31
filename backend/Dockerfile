# Multi-Stage Build for Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S rimsgroup && adduser -S rimsuser -G rimsgroup
USER rimsuser
COPY --from=builder /app/target/retail-inventory-management-system-1.0.0.jar app.jar

ENV SPRING_PROFILES_ACTIVE=postgres
EXPOSE 10000
ENTRYPOINT ["sh", "-c", "exec java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dspring.datasource.url=jdbc:postgresql://${POSTGRES_HOST:-localhost}:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-rims_db} -Dspring.datasource.username=${POSTGRES_USER:-rims_user} -Dspring.datasource.password=${POSTGRES_PASSWORD:-rims_secure_password_2026} -jar app.jar"]
