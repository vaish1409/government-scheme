#!/usr/bin/env bash
# One-time setup for an Ubuntu 22.04 / 24.04 VM:
#   Docker + k3s (a small, real Kubernetes) + Jenkins.
# Run:  bash jenkins/setup-vm.sh
set -euo pipefail

if [ "$(id -u)" -eq 0 ]; then
  echo "Run this as your normal user (it uses sudo), not as root."; exit 1
fi

echo "==> 1/5 Base packages and Java"
sudo apt-get update
sudo apt-get install -y ca-certificates curl git fontconfig openjdk-21-jre

echo "==> 2/5 Docker"
sudo apt-get install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

echo "==> 3/5 Kubernetes (k3s)"
if ! command -v k3s >/dev/null; then
  curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
fi
mkdir -p "$HOME/.kube"
sudo cp /etc/rancher/k3s/k3s.yaml "$HOME/.kube/config"
sudo chown "$USER":"$USER" "$HOME/.kube/config"

echo "==> 4/5 Jenkins (LTS)"
if ! command -v jenkins >/dev/null && [ ! -d /var/lib/jenkins ]; then
  curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key \
    | sudo tee /usr/share/keyrings/jenkins-keyring.asc >/dev/null
  echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" \
    | sudo tee /etc/apt/sources.list.d/jenkins.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y jenkins
fi

echo "==> 5/5 Let Jenkins use Docker and Kubernetes"
sudo usermod -aG docker jenkins
sudo mkdir -p /var/lib/jenkins/.kube
sudo cp /etc/rancher/k3s/k3s.yaml /var/lib/jenkins/.kube/config
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
sudo systemctl enable jenkins
sudo systemctl restart jenkins

IP=$(hostname -I | awk '{print $1}')
echo
echo "Done. Log out and back in once so your own 'docker' commands work without sudo."
echo "VM IP address : $IP"
echo "Jenkins       : http://$IP:8080"
echo "Unlock password (paste into the Jenkins page):"
for i in $(seq 1 30); do
  if sudo test -f /var/lib/jenkins/secrets/initialAdminPassword; then
    sudo cat /var/lib/jenkins/secrets/initialAdminPassword; break
  fi
  sleep 2
done
echo
echo "Check Kubernetes:  kubectl get nodes"
