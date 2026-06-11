# TaskFlow UI â€” GitOps with Argo CD & Minikube: Complete Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Docker Desktop | 24+ | https://docs.docker.com/get-docker/ |
| Minikube | 1.32+ | https://minikube.sigs.k8s.io/docs/start/ |
| kubectl | 1.29+ | https://kubernetes.io/docs/tasks/tools/ |
| Helm | 3.14+ | https://helm.sh/docs/intro/install/ |
| Node.js | 20+ | https://nodejs.org/ |
| Git | any | https://git-scm.com/ |
| GitHub account | â€” | https://github.com/ |
| Docker Hub account | â€” | https://hub.docker.com/ |

---

## Step 1 â€” Prepare GitHub Repositories

Create two public (or private) repositories on GitHub:

```
taskflow-ui       # application source code
taskflow-gitops   # helm chart + values.yaml (this repo)
```

Push the respective folders from this project:

```bash
# From ArgoCD/taskflow-ui
git init && git add . && git commit -m "feat: initial taskflow-ui"
git remote add origin https://github.com/riteshchandure7/taskflow-ui.git
git push -u origin main

# From ArgoCD/taskflow-gitops
git init && git add . && git commit -m "feat: initial helm chart"
git remote add origin https://github.com/riteshchandure7/taskflow-gitops.git
git push -u origin main
```

---

## Step 2 â€” Configure GitHub Actions Secrets

In the **taskflow-ui** repository â†’ Settings â†’ Secrets and variables â†’ Actions:

| Secret | Value |
|--------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (Account Settings â†’ Security) |
| `GITOPS_REPO` | `riteshchandure7/taskflow-gitops` |
| `GITOPS_TOKEN` | GitHub PAT with `repo` write scope |

---

## Step 3 â€” Update Placeholders

In **taskflow-gitops/helm-chart/values.yaml** replace:
```yaml
image:
  repository: your-dockerhub-username/taskflow-ui   # â† your Docker Hub username
```

In **taskflow-gitops/argocd-application.yaml** replace:
```yaml
source:
  repoURL: https://github.com/riteshchandure7/taskflow-gitops.git  # â† your username
```

---

## Step 4 â€” Start Minikube with Ingress

```bash
minikube start --cpus=2 --memory=4096
minikube addons enable ingress
minikube addons enable ingress-dns

# Verify ingress controller is running
kubectl get pods -n ingress-nginx
```

---

## Step 5 â€” Install Argo CD

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

## Step 6 â€” Register the GitOps Repository in Argo CD

```bash
argocd repo add https://github.com/riteshchandure7/taskflow-gitops.git \
  --username riteshchandure7 \
  --password YOUR_GITHUB_PAT
```

---

## Step 7 â€” Deploy the Argo CD Application

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

## Step 8 â€” Access the Application

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

## Step 9 â€” Validate the Full GitOps Loop

### 1. Verify initial deployment
```bash
kubectl get pods -n taskflow
kubectl get ingress -n taskflow
argocd app get taskflow-ui   # Status: Synced, Health: Healthy
```

### 2. Trigger a new deployment (the GitOps loop)

Edit any source file â€” for example bump the version comment in `src/App.jsx`, then push:

```bash
git add . && git commit -m "feat: v1.1.0 â€” test gitops loop"
git push origin main
```

### 3. Watch the pipeline

```
GitHub Actions:
  âœ“ npm install
  âœ“ npm build
  âœ“ docker build & push â†’ docker.io/riteshchandure7/taskflow-ui:<sha>
  âœ“ checkout taskflow-gitops
  âœ“ sed image.tag â†’ <sha>
  âœ“ git commit & push

Argo CD:
  â†’ detects new commit in taskflow-gitops (polls every 3 min by default)
  â†’ diff: image.tag changed
  â†’ applies updated Deployment
  â†’ Kubernetes performs RollingUpdate (maxUnavailable=0)
  â†’ new pods become Ready
  â†’ old pods terminated
  â†’ Status: Synced, Health: Healthy
```

### 4. Confirm new version
```bash
kubectl describe deployment taskflow-ui -n taskflow | grep Image
# Should show the new SHA tag

# The footer of the app shows the deployed version
```

---

## Helm Chart â€” Manual Operations

```bash
# Dry-run / template preview
helm template taskflow taskflow-gitops/helm-chart --namespace taskflow

# Lint
helm lint taskflow-gitops/helm-chart

# Install directly (bypass Argo CD â€” useful for debugging)
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
# Argo CD â€” force sync
argocd app sync taskflow-ui

# Argo CD â€” enable auto-sync (if it somehow got disabled)
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
   â”‚  git push â†’ main
   â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  GitHub                 â”‚
â”‚  taskflow-ui (source)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚ triggers
             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  GitHub Actions CI/CD   â”‚
â”‚  1. npm ci + npm build  â”‚
â”‚  2. docker build & push â”‚â”€â”€â–º Docker Hub
â”‚  3. update values.yaml  â”‚
â”‚  4. git push            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚ commit
             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  GitHub                 â”‚
â”‚  taskflow-gitops        â”‚â—„â”€â”€ Argo CD polls (3 min)
â”‚  helm-chart/values.yaml â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚ detects drift
             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Argo CD (in Minikube)  â”‚
â”‚  sync â†’ apply Helm diff â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚ RollingUpdate
             â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Kubernetes (Minikube)  â”‚
â”‚  namespace: taskflow    â”‚
â”‚  â€¢ Deployment           â”‚
â”‚  â€¢ Service (ClusterIP)  â”‚
â”‚  â€¢ Ingress (nginx)      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚
             â–¼ http://taskflow.local
          Browser
```
