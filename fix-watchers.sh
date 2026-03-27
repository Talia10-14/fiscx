#!/bin/bash
# Fix file watcher limit for development

echo "Augmentation de la limite de file watchers..."

# Augmenter temporairement pour la session actuelle
sudo sysctl -w fs.inotify.max_user_watches=524288

# Faire enregistrer la modification de manière permanente
echo "fs.inotify.max_user_watches = 524288" | sudo tee -a /etc/sysctl.conf

# Recharger la configuration sysctl
sudo sysctl -p

echo "✅ Limite augmentée à 524288"
echo "Vous pouvez maintenant relancer: npm run dev"
