{{/*
Expand the name of the chart.
*/}}
{{- define "taskflow-ui.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
Truncate at 63 chars because some Kubernetes name fields have a limit.
*/}}
{{- define "taskflow-ui.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "taskflow-ui.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels applied to every resource.
*/}}
{{- define "taskflow-ui.labels" -}}
helm.sh/chart: {{ include "taskflow-ui.chart" . }}
{{ include "taskflow-ui.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Selector labels — used in both Deployment.spec.selector and Service.spec.selector.
Keep these stable: changing them requires a blue/green deploy.
*/}}
{{- define "taskflow-ui.selectorLabels" -}}
app.kubernetes.io/name: {{ include "taskflow-ui.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
