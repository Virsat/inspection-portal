# AWS EC2 Deployment Guide: inspection.virsat.com

This guide provides step-by-step instructions to deploy the Inspection Portal (Next.js, NestJS, and PostgreSQL) onto a single Ubuntu-based AWS EC2 instance.

## 1. AWS Infrastructure Setup

### Launch EC2 Instance
- **AMI**: Ubuntu 22.04 LTS.
- **Instance Type**: `t3.medium` (Recommended for smooth Next.js builds).
- **Security Group Rules**:
  - `SSH` (Port 22): My IP.
  - `HTTP` (Port 80): Custom (Anywhere).
  - `HTTPS` (Port 443): Custom (Anywhere).

### Configure Static IP (Elastic IP)
1. Go to **Elastic IPs** in a the EC2 dashboard.
2. **Allocate Elastic IP address**.
3. **Associate** it with your running instance.
4. **DNS Update**: Log in to your domain provider (virsat.com) and create an **A-record** for `inspection` pointing to this Elastic IP.

---

## 2. Server Environment Setup

Connect to your server via SSH:
```bash
ssh -i your-key.pem ubuntu@your-elastic-ip
```

### Install Core Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git curl build-essential
```

### Install Node.js (via NVM)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pm2
```

### Install & Configure PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'Str1ctP@ssw0rd_2026_!';"
sudo -u postgres psql -c "CREATE DATABASE inspector_db;"
```

---

## 3. Application Deployment

### Clone Repository
```bash
git clone <your-repository-url> app
cd app
```

### Backend Deployment (NestJS)
```bash
cd backend
npm install
# Create production .env file
nano .env
```
Add the following to `.env`:
```env
DATABASE_URL="postgresql://postgres:Str1ctP@ssw0rd_2026_!@localhost:5432/inspector_db?schema=public"
JWT_SECRET="cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce"
PORT=3001
NODE_ENV=production
```
Build and run:
```bash
npx prisma generate
npx prisma db push
npm run build
pm2 start dist/main.js --name backend
```

### Frontend Deployment (Next.js)
```bash
cd ../frontend
npm install
# Build with production URL
export NEXT_PUBLIC_API_URL=https://inspection.virsat.com/api
npm run build
pm2 start npm --name frontend -- start
```

---

## 4. Reverse Proxy & SSL (Nginx)

### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/inspection
```
Paste this configuration:
```nginx
server {
    server_name inspection.virsat.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/; # Note the trailing slash
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/inspection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Secure with SSL (Certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d inspection.virsat.com
```
Follow the prompts to enable HTTPS. Certbot will automatically update the Nginx file.

---

## 5. Maintenance
To check status of your apps:
```bash
pm2 list
pm2 logs
```
To restart apps after code updates:
```bash
pm2 restart all
```
