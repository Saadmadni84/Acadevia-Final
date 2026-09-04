# Acadevia — Shared Cloud Storage & Database Architecture Guide

This guide explains how to transition Acadevia from **local single-machine Docker volumes** to a **shared, cloud-ready architecture** so that teachers and students on different laptops, mobile devices, and environments connect to the exact same shared video content and database.

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Clients (Any Device / Laptop)                         │
│                                                                                 │
│   Teacher Laptop (Rahul)                   Student Laptop (Friend)              │
│   Browser: localhost:5173 or Web           Browser: localhost:5173 or Web       │
└───────────────────────┬───────────────────────────────┬─────────────────────────┘
                        │ REST / API Calls              │
                        ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         Acadevia API Gateway (:8080)                            │
│                              (Cloud Deployed)                                   │
└───────────────────────┬───────────────────────────────┬─────────────────────────┘
                        │ Internal Route                │
                        ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         content-service (:8084)                                 │
│  - Receives video upload multipart streams                                      │
│  - Saves binary to cloud bucket & metadata to cloud DB                          │
│  - Generates dynamic, expiring S3 Presigned URLs                                │
│  - Provides HTTP 206 Partial Content range-streaming fallback                  │
└───────────────────────┬───────────────────────────────┬─────────────────────────┘
                        │                               │
            Metadata    │                               │  Binary Upload /
            SQL Queries │                               │  Presigned URL Signatures
                        ▼                               ▼
┌──────────────────────────────────┐        ┌─────────────────────────────────────┐
│       Shared Cloud MySQL         │        │    Shared Cloud Object Storage      │
│      (AWS RDS / Aiven 8.0)       │        │  (Cloudflare R2 / AWS S3 / MinIO)   │
│                                  │        │                                     │
│  - Schemas: acadevia_content,    │        │  - Bucket: acadevia-videos (PRIVATE)│
│    acadevia_auth, acadevia_user  │        │  - Bucket: acadevia-images (PRIVATE)│
│  - Video metadata, chapter IDs,  │        │  - Bucket: acadevia-documents       │
│    file size, object keys        │        │  - Presigned GET URLs with SigV4    │
└──────────────────────────────────┘        └─────────────────────────────────────┘
```

### Why Local Volumes Don't Share Across Machines
- In default local Docker Compose, MinIO saves objects to the local Docker volume `minio-data` and MySQL saves rows to `mysql-data` on your laptop's hard drive.
- When your friend runs the app on their laptop, their Docker creates **its own empty volumes**.
- By pointing both instances (or a deployed cloud instance) to a **shared cloud database** and **shared S3-compatible cloud object storage**, all users see, upload, play, and download the exact same content.

---

## 2. Cloud Storage Provider Recommendation

We recommend **Cloudflare R2** for educational video platforms, with **AWS S3** as the enterprise standard.

### Why Cloudflare R2 is Recommended:
1. **Zero Egress Fees**: Standard cloud providers (like AWS S3) charge ~$0.09 per GB of downloaded data. Streaming 400 MB videos to hundreds of students can create thousands of dollars in egress bills. Cloudflare R2 has **$0.00 egress charges**.
2. **Full S3 API Compatibility**: R2 implements the standard Amazon S3 API. Acadevia's existing backend AWS S3 client works seamlessly with R2 simply by setting `STORAGE_ENDPOINT`.
3. **Global Edge CDN**: Native global edge network ensures low latency and fast video buffering for students across India.

---

## 3. Step-by-Step Setup

### Step A: Cloudflare R2 Setup (Recommended)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2 Object Storage**.
2. Click **Create Bucket**:
   - Create bucket: `acadevia-videos`
   - Create bucket: `acadevia-images`
   - Create bucket: `acadevia-documents`
   - Create bucket: `acadevia-backups`
   - **Keep all buckets Private** (do not enable public bucket access).
3. Generate S3 API Credentials:
   - In R2 Overview, click **Manage R2 API Tokens** → **Create API Token**.
   - Permissions: **Object Read & Write**.
   - Copy:
     - **Access Key ID**
     - **Secret Access Key**
     - **Endpoint URL**: `https://<account_id>.r2.cloudflarestorage.com`
4. Configure Bucket CORS (Required for Range Video Streaming):
   - In the `acadevia-videos` bucket → **Settings** → **CORS Policy** → paste:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "HEAD", "PUT", "POST"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag", "Content-Range", "Accept-Ranges", "Content-Length"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### Step B: AWS S3 Setup (Alternative)
1. Open AWS Management Console → **Amazon S3** → **Create Bucket**.
2. Name: `acadevia-videos` (e.g. in region `ap-south-1` Mumbai or `us-east-1`).
3. Check **Block all public access** (keep bucket private).
4. In IAM, create a service user with an S3 policy granting `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`, and `s3:ListBucket` for your buckets.
5. In Bucket Permissions → **Cross-origin resource sharing (CORS)**, paste the CORS policy from above.

### Step C: Shared Cloud MySQL Setup
1. Launch a MySQL 8 instance on **AWS RDS**, **Aiven**, or **DigitalOcean Managed Database**.
2. Create the service databases:
   ```sql
   CREATE DATABASE acadevia_content CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE acadevia_auth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE acadevia_user CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE DATABASE acadevia_course CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Copy the database hostname (e.g. `acadevia-db.xxxx.rds.amazonaws.com`), port (`3306`), username, and password.

---

## 4. Environment Variables Reference

Configure these in your deployment `.env` file (or CI/CD environment secrets):

| Variable | Description | Example (Cloudflare R2) | Example (Local Dev) |
| :--- | :--- | :--- | :--- |
| `STORAGE_ENDPOINT` | Internal/API S3 endpoint | `https://<id>.r2.cloudflarestorage.com` | `http://minio:9000` |
| `STORAGE_PUBLIC_URL` | Public endpoint for browser presigned URLs | `https://<id>.r2.cloudflarestorage.com` | `http://localhost:9000` |
| `STORAGE_ACCESS_KEY` | Storage Access Key ID | `<your_r2_access_key>` | `minioadmin` |
| `STORAGE_SECRET_KEY` | Storage Secret Access Key | `<your_r2_secret_key>` | `minioadmin` |
| `STORAGE_REGION` | Storage Region | `auto` (for R2) or `ap-south-1` | `us-east-1` |
| `STORAGE_PATH_STYLE_ENABLED` | Path-style bucket access | `true` | `true` |
| `STORAGE_BUCKET_VIDEOS` | Video bucket name | `acadevia-videos` | `acadevia-videos` |
| `STORAGE_PRESIGNED_EXPIRY_MINUTES` | Presigned URL validity | `15` | `15` |
| `MYSQL_HOST` | Database Hostname | `mydb.xxxx.rds.amazonaws.com` | `mysql` |
| `DB_USE_SSL` | Enable MySQL TLS/SSL | `true` | `false` |
| `VITE_API_BASE_URL` | Frontend API Target | `https://api.acadevia.com` | `http://localhost:8080` |

---

## 5. How Your Friend Connects to the Shared Deployment

Once your backend is connected to the shared Cloud Storage and Cloud Database:

### Workflow 1: Friend Runs Frontend Locally (Connecting to Shared Backend)
Your friend clones the repo on their laptop and runs:
```bash
cd acadevia-frontend
npm install
VITE_API_BASE_URL=https://your-deployed-gateway-or-ip.com npm run dev
```
1. They open `http://localhost:5173`.
2. They log in as student (`aarav.sharma10@demo.acadevia.com` / `Student@10`) or teacher.
3. They navigate to **Class 10 → Mathematics → Real Numbers**.
4. The frontend fetches video metadata from the shared database and receives the presigned cloud playback URL.
5. The video streams and plays directly from cloud storage.

### Workflow 2: Friend Runs Local Docker Stack with Shared Cloud Storage
Your friend can also run their own local services connected to the shared cloud storage:
1. In `acadevia-infrastructure/docker/.env`, set `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`, and `STORAGE_SECRET_KEY` to the cloud credentials.
2. Run `make dev`.
3. All videos uploaded by any team member are immediately accessible.

---

## 6. Safe Local → Cloud Migration Runbook

To copy existing local MinIO videos and local MySQL metadata to your cloud environment without touching or deleting local files:

### Step 1: Run the Automated Migration Tool
From the repository root:
```bash
TARGET_STORAGE_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com" \
TARGET_STORAGE_KEY="<your_cloud_key>" \
TARGET_STORAGE_SECRET="<your_cloud_secret>" \
TARGET_DB_HOST="<cloud_db_host>" \
TARGET_DB_USER="<cloud_db_user>" \
TARGET_DB_PASS="<cloud_db_pass>" \
./acadevia-infrastructure/scripts/migrate-storage-and-db.sh
```

### Step 2: Manual Object Copy (using MinIO Client `mc`)
If you prefer running `mc` directly:
```bash
# Configure aliases
mc alias set local-minio http://127.0.0.1:9000 minioadmin minioadmin
mc alias set cloud-s3 https://<account_id>.r2.cloudflarestorage.com <access_key> <secret_key>

# Mirror videos to cloud bucket (non-destructive)
mc mirror --overwrite local-minio/acadevia-videos cloud-s3/acadevia-videos
```

### Step 3: Verify Data
1. Check object keys match in cloud bucket (`videos/10/1/...mp4`).
2. Verify row exists in cloud MySQL `acadevia_content.videos`.
3. In student view, verify video plays and seek bar works properly.
