#!/bin/bash
# Start Vite with polling mode (no inotify watchers needed)

echo "🚀 Démarrage de Vite avec mode polling..."
export CHOKIDAR_USEPOLLING=true
export CHOKIDAR_INTERVAL=1000
cd /home/justalie/Téléchargements/fisc/frontend
npm run dev
