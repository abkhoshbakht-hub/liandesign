import { setTestActor, getTestActor } from "../lib/test-actor";

let local: unknown = null;
function setLocal(a: unknown) { local = a; }
function getLocal() { return local; }

console.log("env-ok:", process.env.ADS_TEST_SEAM === "1");
setLocal({ id: "x" });
console.log("inline:", JSON.stringify(getLocal()));
setTestActor({ id: "x", role: "ADMIN" });
console.log("imported:", JSON.stringify(getTestActor()));
console.log("same-fn:", setTestActor.name, getTestActor.name);
