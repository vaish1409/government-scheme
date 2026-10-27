# Saksham on Kubernetes with a Jenkins CI/CD pipeline

This guide runs Saksham inside a virtual machine using **Docker**, **Kubernetes (k3s)** and **Jenkins**.
Your existing `docker-compose.yml`, Dockerfiles and the EC2 deployment are **not changed**.

```
 you push code ──► GitHub ──► Jenkins (polls every minute)
                                 │ 1. checkout
                                 │ 2. run backend tests (Node container)
                                 │ 3. docker build  (backend + frontend images)
                                 │ 4. docker push   (Docker Hub)
                                 │ 5. kubectl apply + rolling update
                                 │ 6. smoke test    (calls /api/schemes)
                                 ▼
                        Kubernetes (k3s) namespace "saksham"
                          ├─ frontend pods (nginx)  ◄── NodePort 30080 (the website)
                          ├─ backend pods  (Node/Express)
                          └─ postgres pod  (+ 1Gi persistent volume)
```

## What was added (nothing was deleted)

| File | Purpose |
|---|---|
| `k8s/00-namespace.yaml` | A separate space called `saksham` in the cluster |
| `k8s/01-config.yaml` | Settings (ConfigMap) and the nginx config used inside Kubernetes |
| `k8s/02-postgres.yaml` | Database pod, storage and Service |
| `k8s/03-backend.yaml` | Backend Deployment, health probes, Service |
| `k8s/04-frontend.yaml` | Frontend Deployment and the NodePort Service (port 30080) |
| `k8s/jobs/seed-job.yaml` | One-off Job that loads schemes, lessons and demo data |
| `Jenkinsfile` | The CI/CD pipeline |
| `jenkins/setup-vm.sh` | Installs Docker, k3s and Jenkins on the VM |
| `backend/tests/engine.test.js` and `"test"` in `backend/package.json` | Three unit tests so the pipeline has a real test stage |

Optional: `.github/workflows/deploy.yml` still deploys to EC2 on every push to `master`. It is harmless and
can stay. If your EC2 server is switched off it will show a red cross on GitHub; you can ignore it, or
disable it in the repo's Actions tab.

---

## Before you start

**VM:** Ubuntu 22.04 or 24.04, at least **2 CPUs and 4 GB RAM**, 25 GB disk, internet access.

**VM network:** in VirtualBox or VMware set the network adapter to **Bridged Adapter**. With the default
NAT setting your laptop's browser cannot reach the VM's ports. (With NAT you would have to add port-forward rules for 8080 and 30080.)

**Accounts:** a free **Docker Hub** account (hub.docker.com). Create an access token under
Account Settings → Personal access tokens (Read & Write) and keep it somewhere safe.

---

## Step 1. Get the files into your repo

On your laptop, in the `government-scheme` folder, copy in everything from the zip, keeping the same
folder names, and replace `backend/package.json` with the one in the zip. Or, if you prefer, make the few edits by hand:

- `backend/package.json`: in `"scripts"`, add `"test": "node --test"` (put a comma after the `seed` line).
- Add the new folders `k8s/`, `jenkins/`, `backend/tests/`, the file `Jenkinsfile` and this guide.

## Step 2. Edit exactly two things

1. **`Jenkinsfile`**: change `YOUR_DOCKERHUB_USERNAME` to your Docker Hub username.
2. **`k8s/01-config.yaml`**: change both `YOUR_VM_IP` values to the VM's IP address
   (you get the IP in Step 3; come back and edit this before the first pipeline run).

Do **not** commit passwords. Secrets are created on the VM in Step 6.

## Step 3. Install everything on the VM

On the VM:

```bash
sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/vaish1409/government-scheme.git
cd government-scheme
bash jenkins/setup-vm.sh
```

(If you haven't pushed your changes yet, push them from the laptop first, then clone.)
It takes about 5 to 10 minutes. At the end it prints the **VM IP**, the **Jenkins address**
(`http://VM-IP:8080`) and the **unlock password**. Copy them. Then **log out and log in again** once.

Check it worked:

```bash
docker ps          # works without sudo
kubectl get nodes  # shows one node with STATUS Ready
```

If you didn't finish Step 2 yet, edit the IP in `k8s/01-config.yaml` now, then commit and push from the laptop.

## Step 4. Set up Jenkins (one time, in the browser)

1. Open `http://VM-IP:8080`, paste the unlock password, choose **Install suggested plugins**, create your admin user.
2. **Add Docker Hub login:** Manage Jenkins → Credentials → System → Global credentials → Add Credentials.
   Kind: *Username with password*. Username: your Docker Hub name. Password: the **access token**.
   ID: `dockerhub-creds` (exactly this).
3. **Create the pipeline:** Dashboard → New Item → name `saksham` → *Pipeline* → OK. Then:
   - Pipeline → Definition: **Pipeline script from SCM**
   - SCM: **Git**, Repository URL: `https://github.com/vaish1409/government-scheme.git`
   - Branch: `*/master`
   - Script Path: `Jenkinsfile`
   - Save.

## Step 5. Prepare the cluster

On the VM, inside the `government-scheme` folder:

```bash
kubectl apply -f k8s/00-namespace.yaml
```

## Step 6. Create the secret (passwords)

```bash
kubectl -n saksham create secret generic saksham-secret \
  --from-literal=DB_PASSWORD='choose-a-strong-password' \
  --from-literal=JWT_SECRET="$(openssl rand -hex 32)" \
  --from-literal=OFFICER_KEY='choose-an-officer-key'
```

This is stored in the cluster only, never in GitHub.

## Step 7. Run the pipeline

In Jenkins open `saksham` → **Build Now**. Click the build number → **Console Output** to watch.
The first run is slow (it downloads images and builds); later runs are faster.
All stages should turn green: Checkout, Test backend, Build Docker images, Push to Docker Hub,
Deploy to Kubernetes, Smoke test.

Then watch the pods start:

```bash
kubectl -n saksham get pods
```

You want `postgres`, `backend` and two `frontend` pods all `Running` and `1/1` ready.

## Step 8. Load the starting data (once)

```bash
sed "s|__BACKEND_IMAGE__|YOUR_DOCKERHUB_USERNAME/saksham-backend:latest|" k8s/jobs/seed-job.yaml | kubectl apply -f -
kubectl -n saksham logs job/seed
```

You should see "Seeding complete". Run `kubectl -n saksham delete job seed` before running it again.

## Step 9. Open the app

From your laptop's browser: **`http://VM-IP:30080`**

---

## Demo script for your teacher (about 10 minutes)

**1. Docker.** `docker images | grep saksham` shows the images Jenkins built. Show `backend/Dockerfile`
(multi-stage frontend build, non-root user, health check).

**2. Kubernetes and pods.**
```bash
kubectl -n saksham get pods -o wide
kubectl -n saksham get deployments,services
kubectl -n saksham describe deployment backend    # probes, resources, strategy
```
Containers inside pods: `sudo k3s crictl ps` (k3s uses containerd, so they do not appear in `docker ps`).

**3. Scaling.**
```bash
kubectl -n saksham scale deployment backend --replicas=3
kubectl -n saksham get pods -w          # Ctrl+C to stop watching
```

**4. Self-healing.** Delete a pod and watch Kubernetes create a replacement:
```bash
kubectl -n saksham delete pod <one-backend-pod-name>
kubectl -n saksham get pods
```
The website stays up because the other pods keep serving.

**5. CI/CD, the main event.** Make a visible change. For example, in `frontend/index.html` change the
`<title>` text to `Saksham — Voice Livelihood Assistant v2`, then commit and push. Within a minute Jenkins starts
a build by itself. Show the stages going green, then:
```bash
kubectl -n saksham rollout status deployment/frontend
kubectl -n saksham get pods
```
Reload the site with Ctrl+Shift+R and the browser tab shows the new title.

**6. Rolling update history and rollback.**
```bash
kubectl -n saksham rollout history deployment/frontend
kubectl -n saksham rollout undo deployment/frontend
```

**7. Logs and debugging.**
```bash
kubectl -n saksham logs deployment/backend
kubectl -n saksham describe pod <pod-name>
```

---

## If something goes wrong

| Problem | Cause and fix |
|---|---|
| Jenkins "permission denied" on docker | `sudo usermod -aG docker jenkins && sudo systemctl restart jenkins` |
| `kubectl: command not found` in Jenkins | k3s installs it at `/usr/local/bin/kubectl`; check `kubectl version` works on the VM. |
| Jenkins "connection refused" to the cluster | Re-copy the config: `sudo cp /etc/rancher/k3s/k3s.yaml /var/lib/jenkins/.kube/config && sudo chown jenkins:jenkins /var/lib/jenkins/.kube/config` |
| Deploy stage says secret missing | Do Step 6, then Build Now again. |
| Push stage `unauthorized` | Wrong `dockerhub-creds`, or the token is read-only. Recreate it with Read & Write. |
| Pod `ImagePullBackOff` | The image name is wrong or the push failed. `kubectl -n saksham describe pod <name>`. Check your username in the `Jenkinsfile`. |
| Backend pod `CrashLoopBackOff` | `kubectl -n saksham logs <pod>`. Usually a wrong secret or database not ready yet; wait a minute. |
| Can't open `VM-IP:30080` from laptop | VM network must be Bridged. Test on the VM first: `curl localhost:30080`. |
| Pipeline doesn't start after a push | Polling runs every minute. Check the job's "Git Polling Log". Or press Build Now. |
| Jenkins very slow or out of memory | Give the VM 4 GB RAM or more. |
| Test stage fails | Run `cd backend && npm test` on your laptop and read the message. |

## Questions your teacher may ask

- **Why Kubernetes and not just Docker?** Docker runs containers on one machine. Kubernetes keeps the
  desired number of pods running, restarts failed ones, scales up with one command, and updates with no downtime.
- **What is a pod?** The smallest unit Kubernetes runs: one or more containers sharing a network address.
- **Deployment vs Service?** A Deployment keeps N copies of a pod running. A Service gives them one stable address and balances traffic.
- **What is a rolling update?** New pods start and become ready before old ones are removed (`maxUnavailable: 0`), so users see no downtime.
- **What do the probes do?** Readiness decides whether a pod receives traffic; liveness restarts a stuck pod. Both call the backend's `/health`.
- **Where are secrets kept?** In a Kubernetes Secret created on the cluster, not in Git. Non-secret settings are in a ConfigMap.
- **Why does the pipeline use polling?** The VM has no public address, so GitHub cannot call Jenkins. With a public server you'd use a webhook.
- **What happens if a deploy breaks?** The pipeline waits for the rollout; on failure it runs `kubectl rollout undo`.
- **Why k3s?** It is a lightweight, certified Kubernetes distribution that runs comfortably on a small VM.
