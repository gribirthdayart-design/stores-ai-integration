#!/usr/bin/env bash
# リール「レンタルの流れ」を書き出す。
# 使い方: bash build.sh <素材フォルダ> <作業フォルダ>
#   素材フォルダに IMG_1249.mov IMG_1251.mov IMG_1263.mov IMG_5747.mov IMG_5748.mov を置く
set -euo pipefail
SRC=${1:?素材フォルダ}; WORK=${2:?作業フォルダ}
HERE=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$WORK/seg" "$WORK/ov"
FPS=30
V="-r $FPS -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -an"
FIT="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=$FPS"

clip(){ # out in start dur
  ffmpeg -v error -y -ss "$3" -t "$4" -i "$SRC/$2" -vf "$FIT" $V "$WORK/seg/$1.mp4"; }
solid(){ # out dur
  ffmpeg -v error -y -f lavfi -i "color=c=white:s=1080x1920:r=$FPS:d=$2" $V "$WORK/seg/$1.mp4"; }

clip  01 IMG_1249.mov 0.3 2.5
solid 02 2.5
solid 03 3
solid 04 2.5
clip  05a IMG_5747.mov 0.5 2.0
clip  05b IMG_5748.mov 1.0 1.5
clip  06 IMG_1263.mov 0.2 3.5
solid 07 4
solid 08 4
solid 09 2.5
clip  10 IMG_1251.mov 1.0 3.0

: > "$WORK/list.txt"
for s in 01 02 03 04 05a 05b 06 07 08 09 10; do echo "file '$WORK/seg/$s.mp4'" >> "$WORK/list.txt"; done
ffmpeg -v error -y -f concat -safe 0 -i "$WORK/list.txt" -c copy "$WORK/base.mp4"

node "$HERE/render_overlay.js" "$HERE/overlay.html" "$WORK/ov" 31 $FPS

ffmpeg -v error -y -i "$WORK/base.mp4" -framerate $FPS -i "$WORK/ov/%04d.png" \
  -f lavfi -i anullsrc=r=44100:cl=stereo \
  -filter_complex "[0:v][1:v]overlay=0:0:shortest=1,format=yuv420p[v]" \
  -map "[v]" -map 2:a -shortest -c:v libx264 -preset slow -crf 18 -profile:v high -c:a aac -b:a 128k \
  -movflags +faststart "$WORK/gri_rental_flow_reel.mp4"
echo "done: $WORK/gri_rental_flow_reel.mp4"
