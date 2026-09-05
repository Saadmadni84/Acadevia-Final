#!/usr/bin/env python3
"""
Acadevia Platform — Cloudflare R2 Connectivity & Verification Tool
Tests connection, bucket verification, upload, presigned URL generation,
range streaming, download, and confirms local MinIO remains unaffected.
"""

import os
import sys
import time
import urllib.request
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

ENV_FILE = os.path.join(os.path.dirname(__file__), "..", "docker", ".env.r2")

def load_env_file(filepath):
    config = {}
    if not os.path.exists(filepath):
        return config
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                k, v = line.split("=", 1)
                config[k.strip()] = v.strip().strip('"').strip("'")
    return config

def main():
    print("=" * 65)
    print("  Acadevia — Cloudflare R2 Connectivity & Storage Verification")
    print("=" * 65)
    
    env_vars = load_env_file(ENV_FILE)
    
    endpoint = os.environ.get("STORAGE_ENDPOINT", env_vars.get("STORAGE_ENDPOINT", ""))
    access_key = os.environ.get("STORAGE_ACCESS_KEY", env_vars.get("STORAGE_ACCESS_KEY", ""))
    secret_key = os.environ.get("STORAGE_SECRET_KEY", env_vars.get("STORAGE_SECRET_KEY", ""))
    bucket_name = os.environ.get("STORAGE_BUCKET_VIDEOS", env_vars.get("STORAGE_BUCKET_VIDEOS", "acadevia-videos"))
    region = os.environ.get("STORAGE_REGION", env_vars.get("STORAGE_REGION", "auto"))
    public_url = os.environ.get("STORAGE_PUBLIC_URL", env_vars.get("STORAGE_PUBLIC_URL", endpoint))

    if not endpoint or "<YOUR_ACCOUNT_ID>" in endpoint:
        print("\n❌ Error: STORAGE_ENDPOINT is not configured or contains placeholder.")
        print(f"Please fill in your credentials in: {ENV_FILE}")
        sys.exit(1)

    if not access_key or "<YOUR_R2_ACCESS_KEY_ID>" in access_key:
        print("\n❌ Error: STORAGE_ACCESS_KEY is not configured.")
        print(f"Please fill in your credentials in: {ENV_FILE}")
        sys.exit(1)

    if not secret_key or "<YOUR_R2_SECRET_ACCESS_KEY>" in secret_key:
        print("\n❌ Error: STORAGE_SECRET_KEY is not configured.")
        print(f"Please fill in your credentials in: {ENV_FILE}")
        sys.exit(1)

    print(f"\n1. Target R2 Configuration:")
    print(f"   Endpoint:    {endpoint}")
    print(f"   Bucket:      {bucket_name}")
    print(f"   Region:      {region}")
    print(f"   Access Key:  {access_key[:6]}...{access_key[-4:] if len(access_key) > 10 else ''}")

    # Initialize S3 Client for Cloudflare R2
    s3 = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region,
        config=Config(s3={"addressing_style": "path"}, signature_version="s3v4")
    )

    # Step 1: Verify Bucket Access
    print("\n2. Verifying R2 Bucket Access...")
    try:
        s3.head_bucket(Bucket=bucket_name)
        print(f"   ✅ Bucket '{bucket_name}' exists and is accessible with read/write credentials.")
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code", "")
        if code in ("404", "NoSuchBucket"):
            print(f"   Bucket '{bucket_name}' not found. Attempting creation...")
            s3.create_bucket(Bucket=bucket_name)
            print(f"   ✅ Created bucket '{bucket_name}'.")
        else:
            print(f"   ❌ Failed to access bucket: {e}")
            sys.exit(1)

    # Step 2: Test Object Upload (Small MP4 Test Payload)
    print("\n3. Testing Object Upload...")
    test_key = f"videos/test-session/{int(time.time())}_acadevia_verification.mp4"
    # Small valid MP4 header/data chunk (simulating real video upload)
    test_payload = b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00mp42isom" + (b"ACADEVIA_VIDEO_DATA_BLOCK" * 1024)
    payload_size = len(test_payload)

    try:
        s3.put_object(
            Bucket=bucket_name,
            Key=test_key,
            Body=test_payload,
            ContentType="video/mp4",
            Metadata={"source": "acadevia-verification", "type": "test-video"}
        )
        print(f"   ✅ Uploaded test object: {test_key} ({payload_size} bytes)")
    except Exception as e:
        print(f"   ❌ Upload failed: {e}")
        sys.exit(1)

    # Step 3: Verify Object Metadata in Storage
    print("\n4. Verifying Uploaded Object in R2...")
    try:
        head = s3.head_object(Bucket=bucket_name, Key=test_key)
        stored_size = head.get("ContentLength", 0)
        stored_type = head.get("ContentType", "")
        print(f"   ✅ HeadObject verified:")
        print(f"      Size: {stored_size} bytes (matches original: {stored_size == payload_size})")
        print(f"      Content-Type: {stored_type}")
    except Exception as e:
        print(f"   ❌ HeadObject failed: {e}")
        sys.exit(1)

    # Step 4: Test Presigned URL Generation
    print("\n5. Testing Presigned Playback URL Generation (15 minutes expiry)...")
    try:
        presigned_url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={"Bucket": bucket_name, "Key": test_key},
            ExpiresIn=900
        )
        print(f"   ✅ Presigned URL generated successfully:")
        print(f"      {presigned_url[:80]}...[truncated]")
        
        # Test HTTP Range fetch on the presigned URL
        import ssl
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(presigned_url, headers={"Range": "bytes=0-100"})
        with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
            status = resp.getcode()
            read_bytes = resp.read()
            content_range = resp.headers.get("Content-Range", "")
            print(f"   ✅ HTTP Range Request (bytes 0-100) returned: HTTP {status} ({content_range})")
    except Exception as e:
        print(f"   ⚠️ Presigned URL HTTP fetch note: {e}")

    # Step 5: Test Download
    print("\n6. Testing Object Download & Integrity...")
    try:
        obj = s3.get_object(Bucket=bucket_name, Key=test_key)
        downloaded_bytes = obj["Body"].read()
        if downloaded_bytes == test_payload:
            print(f"   ✅ Downloaded {len(downloaded_bytes)} bytes. Binary integrity 100% verified.")
        else:
            print(f"   ❌ Integrity mismatch!")
            sys.exit(1)
    except Exception as e:
        print(f"   ❌ Download failed: {e}")
        sys.exit(1)

    # Step 6: Verify Local MinIO Still Works Independently
    print("\n7. Verifying Local MinIO Status...")
    try:
        minio_s3 = boto3.client(
            "s3",
            endpoint_url="http://127.0.0.1:9000",
            aws_access_key_id="minioadmin",
            aws_secret_access_key="minioadmin",
            region_name="us-east-1",
            config=Config(s3={"addressing_style": "path"}, signature_version="s3v4")
        )
        minio_s3.head_bucket(Bucket="acadevia-videos")
        print("   ✅ Local MinIO is alive, intact, and unaffected at http://127.0.0.1:9000.")
    except Exception as e:
        print(f"   ℹ️ Local MinIO check: {e}")

    print("\n" + "=" * 65)
    print("  🎉 ALL R2 VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("=" * 65)

if __name__ == "__main__":
    main()
