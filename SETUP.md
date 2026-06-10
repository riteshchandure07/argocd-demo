# TaskFlow UI — GitOps with Argo CD & Minikube: Complete Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Docker Desktop | 24+ | https://docs.docker.com/get-docker/ |
| Minikube | 1.32+ | https://minikube.sigs.k8s.io/docs/start/ |
| kubectl | 1.29+ | https://kubernetes.io/docs/tasks/tools/ |
| Helm | 3.14+ | https://helm.sh/docs/intro/install/ |
| Node.js | 20+ | https://nodejs.org/ |
| Git | any | https://git-scm.com/ |
| GitHub account | — | https://github.com/ |
| Docker Hub account | — | https://hub.docker.com/ |

---

## Step 1 — Prepare GitHub Repositories

Create two public (or private) repositories on GitHub:

```
taskflow-ui       # application source code
taskflow-gitops   # helm chart + values.yaml (this repo)
```

Push the respective folders from this project:

```bash
# From ArgoCD/taskflow-ui
git init && git add . && git commit -m "feat: initial taskflow-ui"
git remote add origin https://github.com/YOUR_USERNAME/taskflow-ui.git
git push -u origin main

# From ArgoCD/taskflow-gitops
git init && git add . && git commit -m "feat: initial helm chart"
git remote add origin https://github.com/YOUR_USERNAME/taskflow-gitops.git
git push -u origin main
```

---

## Step 2 — Configure GitHub Actions Secrets

In the **taskflow-ui** repository → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (Account Settings → Security) |
| `GITOPS_REPO` | `YOUR_USERNAME/taskflow-gitops` |
| `GITOPS_TOKEN` | GitHub PAT with `repo` write scope |

---

## Step 3 — Update Placeholders

In **taskflow-gitops/helm-chart/values.yaml** replace:
```yaml
image:
  repository: your-dockerhub-username/taskflow-ui   # ← your Docker Hub username
```

In **taskflow-gitops/argocd-application.yaml** replace:
```yaml
source:
  repoURL: https://github.com/YOUR_GITHUB_USERNAME/taskflow-gitops.git  # ← your username
```

---

## Step 4 — Start Minikube with Ingress

```bash
minikube start --cpus=2 --memory=4096
minikube addons enable ingress
minikube addons enable ingress-dns

# Verify ingress controller is running
kubectl get pods -n ingress-nginx
```

---

## Step 5 — Install Argo CD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait until all pods are Running
kubectl wait --for=condition=Ready pod --all -n argocd --timeout=300s

# Expose the Argo CD API server
kubectl port-forward svc/argocd-server -n argocd 8080:443 &

# Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 --decode && echo

# Login via CLI
argocd login localhost:8080 --username admin --insecure
```

Open https://localhost:8080 in your browser to access the Argo CD UI.

---

## Step 6 — Register the GitOps Repository in Argo CD

```bash
argocd repo add https://github.com/YOUR_USERNAME/taskflow-gitops.git \
  --username YOUR_USERNAME \
  --password YOUR_GITHUB_PAT
```

---

## Step 7 — Deploy the Argo CD Application

```bash
kubectl apply -f taskflow-gitops/argocd-application.yaml
```

Watch the sync happen:

```bash
# CLI
argocd app get taskflow-ui
argocd app sync taskflow-ui   # trigger manually the first time

# Watch continuously
watch argocd app get taskflow-ui
```

---

## Step 8 — Access the Application

```bash
# Get Minikube IP
minikube ip     # e.g. 192.168.49.2

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
# 192.168.49.2  taskflow.local

# Or use Minikube tunnel (creates a real load-balancer IP)
minikube tunnel
```

Open http://taskflow.local in your browser.

---

## Step 9 — Validate the Full GitOps Loop

### 1. Verify initial deployment
```bash
kubectl get pods -n taskflow
kubectl get ingress -n taskflow
argocd app get taskflow-ui   # Status: Synced, Health: Healthy
```

### 2. Trigger a new deployment (the GitOps loop)

Edit any source file — for example bump the version comment in `src/App.jsx`, then push:

```bash
git add . && git commit -m "feat: v1.1.0 — test gitops loop"
git push origin main
```

### 3. Watch the pipeline

```
GitHub Actions:
  ✓ npm install
  ✓ npm build
  ✓ docker build & push → docker.io/YOUR_USERNAME/taskflow-ui:<sha>
  ✓ checkout taskflow-gitops
  ✓ sed image.tag → <sha>
  ✓ git commit & push

Argo CD:
  → detects new commit in taskflow-gitops (polls every 3 min by default)
  → diff: image.tag changed
  → applies updated Deployment
  → Kubernetes performs RollingUpdate (maxUnavailable=0)
  → new pods become Ready
  → old pods terminated
  → Status: Synced, Health: Healthy
```

### 4. Confirm new version
```bash
kubectl describe deployment taskflow-ui -n taskflow | grep Image
# Should show the new SHA tag

# The footer of the app shows the deployed version
```

---

## Helm Chart — Manual Operations

```bash
# Dry-run / template preview
helm template taskflow taskflow-gitops/helm-chart --namespace taskflow

# Lint
helm lint taskflow-gitops/helm-chart

# Install directly (bypass Argo CD — useful for debugging)
helm upgrade --install taskflow taskflow-gitops/helm-chart \
  --namespace taskflow --create-namespace \
  --set image.tag=<sha> \
  --set replicaCount=3

# Uninstall
helm uninstall taskflow -n taskflow
```

---

## Useful Commands

```bash
# Argo CD — force sync
argocd app sync taskflow-ui

# Argo CD — enable auto-sync (if it somehow got disabled)
argocd app set taskflow-ui --sync-policy automated

# Scale replicas live (Argo CD will self-heal back to values.yaml)
kubectl scale deployment taskflow-ui -n taskflow --replicas=4

# View rollout status during a deploy
kubectl rollout status deployment/taskflow-ui -n taskflow

# Rollback via Argo CD (to previous Git revision)
argocd app history taskflow-ui
argocd app rollback taskflow-ui <REVISION_ID>

# Port-forward (no ingress needed)
kubectl port-forward svc/taskflow-ui -n taskflow 3000:80
# Then open http://localhost:3000
```

---

## Architecture Diagram

```
Developer
   │  git push → main
   ▼
┌─────────────────────────┐
│  GitHub                 │
│  taskflow-ui (source)   │
└────────────┬────────────┘
             │ triggers
             ▼
┌─────────────────────────┐
│  GitHub Actions CI/CD   │
│  1. npm ci + npm build  │
│  2. docker build & push │──► Docker Hub
│  3. update values.yaml  │
│  4. git push            │
└────────────┬────────────┘
             │ commit
             ▼
┌─────────────────────────┐
│  GitHub                 │
│  taskflow-gitops        │◄── Argo CD polls (3 min)
│  helm-chart/values.yaml │
└────────────┬────────────┘
             │ detects drift
             ▼
┌─────────────────────────┐
│  Argo CD (in Minikube)  │
│  sync → apply Helm diff │
└────────────┬────────────┘
             │ RollingUpdate
             ▼
┌─────────────────────────┐
│  Kubernetes (Minikube)  │
│  namespace: taskflow    │
│  • Deployment           │
│  • Service (ClusterIP)  │
│  • Ingress (nginx)      │
└─────────────────────────┘
             │
             ▼ http://taskflow.local
          Browser
```
