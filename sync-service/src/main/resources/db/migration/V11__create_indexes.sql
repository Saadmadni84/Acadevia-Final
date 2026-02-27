-- Add composite indexes for hot paths
CREATE INDEX idx_sync_queue_user_entity_version ON sync_queue(user_id, entity_type, version);
CREATE INDEX idx_download_manifest_expiry ON download_manifest(expires_at);
CREATE INDEX idx_bandwidth_log_time ON bandwidth_log(logged_at);
