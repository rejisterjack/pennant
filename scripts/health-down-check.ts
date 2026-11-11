async function main() {
  const { GET } = await import("../src/app/api/health/route");
  const response = await GET();
  const body = await response.text();
  console.log(JSON.stringify({ status: response.status, body }));
}

void main();
