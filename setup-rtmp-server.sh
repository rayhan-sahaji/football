#!/bin/bash
# RTMP Server Setup for Oracle Cloud Free Tier
# Run as root on Ubuntu 22.04

echo "=== Installing nginx-rtmp + FFmpeg ==="

apt-get update
apt-get install -y nginx libnginx-mod-rtmp ffmpeg

# Configure RTMP
cat > /etc/nginx/modules-available/rtmp.conf << 'EOF'
load_module /usr/lib/nginx/modules/ngx_rtmp_module.so;
EOF

# Main nginx config with RTMP
cat > /etc/nginx/nginx.conf << 'EOF'
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

include /etc/nginx/modules-available/rtmp.conf;

rtmp {
    server {
        listen 1935;
        chunk_size 4096;

        application live {
            live on;
            record off;

            # Transcode to HLS
            exec_push ffmpeg -i rtmp://localhost:1935/live/$name
              -c:v libx264 -preset veryfast -b:v 2500k -maxrate 2500k -bufsize 5000k
              -vf scale=1280:720
              -c:a aac -b:a 128k -ar 44100
              -f hls -hls_time 2 -hls_list_size 3 -hls_flags delete_segments
              /var/www/hls/live/$name.m3u8;

            # Also relay to HTTP-FLV
            hls on;
            hls_path /var/www/hls/live;
            hls_fragment 2s;
            hls_playlist_length 6s;
        }
    }
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # CORS headers for HLS
    server {
        listen 8080;

        location /hls/ {
            types {
                application/vnd.apple.mpegurl m3u8;
                video/mp2t ts;
            }

            root /var/www;

            add_header Cache-Control no-cache;
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods GET,HEAD,OPTIONS;
            add_header Access-Control-Allow-Headers Range;
        }

        location /health {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Create HLS directory
mkdir -p /var/www/hls/live
chmod -R 755 /var/www/hls

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo ""
echo "=== Setup Complete ==="
echo "RTMP URL:  rtmp://YOUR_IP:1935/live/stream_key"
echo "HLS URL:   http://YOUR_IP:8080/hls/live/stream_key.m3u8"
echo ""
echo "OBS Settings:"
echo "  Server:  rtmp://YOUR_IP:1935/live"
echo "  Key:     stream_key (any name you want)"
echo ""
echo "Test: ffplay http://YOUR_IP:8080/hls/live/stream_key.m3u8"
