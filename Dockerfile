# 1단계: 빌드
FROM node:alpine as build
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package.json package-lock.json ./
RUN npm install --force

# 소스 파일 복사 및 빌드
COPY . /app
RUN npm run build

# 2단계: Nginx를 사용해 정적 파일 서빙
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
#COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]