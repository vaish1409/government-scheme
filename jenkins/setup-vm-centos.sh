#!/usr/bin/env bash
# One-time setup for a CentOS Stream 10 / RHEL-family VM:
#   Docker + k3s (a small, real Kubernetes) + Jenkins.
# Run as your normal user (it uses sudo):   bash jenkins/setup-vm-centos.sh
set -euo pipefail

if [ "$(id -u)" -eq 0 ]; then
  echo "Run this as your normal user (it uses sudo), not as root."; exit 1
fi
if ! command -v dnf >/dev/null; then
  echo "dnf not found. This script is for CentOS / RHEL / Rocky / Alma. On Ubuntu use jenkins/setup-vm.sh"; exit 1
fi
sudo -v   # asks for your password once

echo "==> 1/6 Base packages and Java"
sudo dnf -y install git curl wget tar fontconfig dnf-plugins-core java-21-openjdk-headless

echo "==> 2/6 Docker"
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"

echo "==> 3/6 Firewall rules (only if firewalld is running)"
if systemctl is-active --quiet firewalld; then
  for p in 8080/tcp 30080/tcp; do
    sudo firewall-cmd --permanent --add-port="$p"
  done
  # let Kubernetes pod and service networks talk to each other
  sudo firewall-cmd --permanent --zone=trusted --add-source=10.42.0.0/16
  sudo firewall-cmd --permanent --zone=trusted --add-source=10.43.0.0/16
  sudo firewall-cmd --reload
fi

echo "==> 4/6 Kubernetes (k3s)"
sudo modprobe br_netfilter || true
echo br_netfilter | sudo tee /etc/modules-load.d/br_netfilter.conf >/dev/null
if ! command -v k3s >/dev/null; then
  curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
fi
mkdir -p "$HOME/.kube"
sudo cp /etc/rancher/k3s/k3s.yaml "$HOME/.kube/config"
sudo chown "$USER":"$USER" "$HOME/.kube/config"

echo "==> 5/6 Jenkins (LTS)"
if [ ! -d /var/lib/jenkins ]; then
  sudo wget -q -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/rpm-stable/jenkins.repo
  sudo rpm --import https://pkg.jenkins.io/rpm-stable/jenkins.io-2026.key
  sudo dnf -y install jenkins
fi

echo "==> 6/6 Let Jenkins use Docker and Kubernetes"
sudo usermod -aG docker jenkins
sudo mkdir -p /var/lib/jenkins/.kube
sudo cp /etc/rancher/k3s/k3s.yaml /var/lib/jenkins/.kube/config
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
sudo restorecon -R /var/lib/jenkins/.kube 2>/dev/null || true
sudo systemctl daemon-reload
sudo systemctl enable jenkins
sudo systemctl restart jenkins

IP=$(hostname -I | awk '{print $1}')
echo
echo "Done. Log out and back in once so your own 'docker' commands work without sudo."
echo "VM IP address : $IP"
echo "Jenkins       : http://$IP:8080"
echo "Unlock password (paste into the Jenkins page):"
for i in $(seq 1 40); do
  if sudo test -f /var/lib/jenkins/secrets/initialAdminPassword; then
    sudo cat /var/lib/jenkins/secrets/initialAdminPassword; break
  fi
  sleep 3
done
echo
echo "Check Kubernetes:  kubectl get nodes"
