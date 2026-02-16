#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://didim-log.xyz}"
API_PREFIX="${API_PREFIX:-/api/v1}"
TEMPLATE_ID="${TEMPLATE_ID:-test-template-id}"
PROBLEM_ID="${PROBLEM_ID:-1000}"
PROGRAMMING_LANGUAGE="${PROGRAMMING_LANGUAGE:-KOTLIN}"
CODE_PAYLOAD="${CODE_PAYLOAD:-fun main() { println(\"hello\") }}"
TOKEN="${TOKEN:-}"

API_ROOT="${BASE_URL%/}${API_PREFIX}"
RENDER_URL="${API_ROOT}/templates/${TEMPLATE_ID}/render"
STATUS_URL="${API_ROOT}/system/status"

echo "[1/4] system status check: ${STATUS_URL}"
status_code=$(curl -sS -o /tmp/didim_status_body.txt -w "%{http_code}" "${STATUS_URL}")
echo "- status: ${status_code}"
head -c 300 /tmp/didim_status_body.txt; echo ""

headers=(-H "Content-Type: application/json")
if [[ -n "${TOKEN}" ]]; then
  headers+=(-H "Authorization: Bearer ${TOKEN}")
fi

escaped_code="${CODE_PAYLOAD//\\/\\\\}"
escaped_code="${escaped_code//\"/\\\"}"
render_body=$(cat <<JSON
{"problemId":${PROBLEM_ID},"programmingLanguage":"${PROGRAMMING_LANGUAGE}","code":"${escaped_code}"}
JSON
)

echo "[2/4] POST render check: ${RENDER_URL}"
post_code=$(curl -sS -o /tmp/didim_render_post_body.txt -w "%{http_code}" -X POST "${RENDER_URL}" "${headers[@]}" --data "${render_body}")
echo "- status: ${post_code}"
head -c 600 /tmp/didim_render_post_body.txt; echo ""

echo "[3/4] legacy GET render check: ${RENDER_URL}?problemId=${PROBLEM_ID}"
if [[ -n "${TOKEN}" ]]; then
  get_code=$(curl -sS -o /tmp/didim_render_get_body.txt -w "%{http_code}" "${RENDER_URL}?problemId=${PROBLEM_ID}" -H "Authorization: Bearer ${TOKEN}")
else
  get_code=$(curl -sS -o /tmp/didim_render_get_body.txt -w "%{http_code}" "${RENDER_URL}?problemId=${PROBLEM_ID}")
fi
echo "- status: ${get_code}"
head -c 600 /tmp/didim_render_get_body.txt; echo ""

echo "[4/4] summary"
if [[ "${post_code}" == "200" ]]; then
  echo "- POST render: OK"
else
  echo "- POST render: FAIL (${post_code})"
fi

echo "- GET render status: ${get_code}"
if [[ -z "${TOKEN}" ]]; then
  echo "- note: TOKEN 미입력 상태라 인증 실패(401)는 정상일 수 있습니다."
fi
