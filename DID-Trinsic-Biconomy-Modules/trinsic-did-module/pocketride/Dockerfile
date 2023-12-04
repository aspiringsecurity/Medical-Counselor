FROM --platform=linux/amd64 node:18-buster as react-builder

# Don't show the npm update available on stderr
ENV CI=true
ENV NO_UPDATE_NOTIFIER=1
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

WORKDIR /app

COPY ./react/package.json ./react/package-lock.json ./react/
WORKDIR /app/react
RUN npm ci

WORKDIR /app
COPY ./react ./react/

# Now that the backend is in place, build front-end and copy it over
WORKDIR /app/react
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS dotnet-builder

WORKDIR /app
# Encourage layer caching for dotnet restore
# https://blog.nimbleways.com/docker-build-caching-for-dotnet-applications-done-right-with-dotnet-subset/
COPY ./demoshared/*.csproj ./demoshared/
COPY ./pocketride/service/*.csproj ./pocketride/service/

RUN dotnet restore \
    --runtime linux-x64 \
    "/app/pocketride/service/PocketRide.csproj"

COPY ./demoshared ./demoshared/
COPY ./pocketride ./pocketride/
COPY --from=react-builder /app/react/dist-pocketrides /app/pocketride/service/wwwroot/

WORKDIR /app/pocketride/service
RUN dotnet publish \
    --configuration Release \
    --output out \
    --self-contained \
    --no-restore \
    --runtime linux-x64


# Build runtime image
FROM --platform=linux/amd64 ubuntu:22.04

EXPOSE 5229
ENV ASPNETCORE_URLS=http://+:5229

# https://docs.microsoft.com/en-us/dotnet/core/run-time-config/globalization
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1
# Don't show the npm update available on stderr
ENV NO_UPDATE_NOTIFIER=1
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

RUN apt-get update \
    && apt-get install libssl-dev ca-certificates -y \
    && apt-get clean

WORKDIR /app
COPY --from=dotnet-builder /app/pocketride/service/out .

ENTRYPOINT ["./PocketRide", "--environment=Production"]
