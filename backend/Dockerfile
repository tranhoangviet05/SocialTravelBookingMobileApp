# ============================================================
# Dockerfile — Laravel Backend
# Base: PHP 8.2 FPM + Apache
# ============================================================

FROM php:8.2-apache

# ── Cài đặt extension PHP cần thiết ────────────────────────
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        sodium \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── Cài Composer ────────────────────────────────────────────
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# ── Cấu hình Apache ─────────────────────────────────────────
ENV APACHE_DOCUMENT_ROOT=/var/www/public

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
        /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' \
        /etc/apache2/apache2.conf \
        /etc/apache2/conf-available/*.conf \
    && a2enmod rewrite

# ── Thiết lập thư mục làm việc ──────────────────────────────
WORKDIR /var/www

# ── Copy source code ─────────────────────────────────────────
COPY . .

# ── Cài dependencies Laravel (bỏ qua platform req php vì PHP 8.5) ──
RUN composer install \
    --no-interaction \
    --no-dev \
    --optimize-autoloader \
    --ignore-platform-req=php

# ── Phân quyền storage & bootstrap/cache ────────────────────
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# ── Expose port ──────────────────────────────────────────────
EXPOSE 8000

# ── Lệnh khởi động ──────────────────────────────────────────
CMD ["sh", "-c", \
    "php artisan key:generate --no-interaction --force && \
     php artisan migrate --force && \
     php artisan config:cache && \
     php artisan route:cache && \
     php artisan serve --host=0.0.0.0 --port=8000"]
