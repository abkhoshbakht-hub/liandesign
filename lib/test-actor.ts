// Test seam for integration tests (§92).
// ONLY honored when ADS_TEST_SEAM=1 (never in production).
// Allows tsx scripts to act as admin/owner without a browser session.

export interface TestActor {
  id: string;
  role: string;
}

let current: TestActor | null = null;

function enabled(): boolean {
  return (process.env.ADS_TEST_SEAM ?? "").trim().toLowerCase() === "1";
}

export function setTestActor(a: TestActor | null): void {
  if (!enabled()) return;
  current = a;
}

export function getTestActor(): TestActor | null {
  if (!enabled()) return null;
  return current;
}
