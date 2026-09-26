import { setTestActor, getTestActor } from "../lib/test-actor";
import { getTestActor as get2 } from "@/lib/test-actor";

console.log("env:", process.env.ADS_TEST_SEAM);
setTestActor({ id: "x", role: "ADMIN" });
console.log("relative:", JSON.stringify(getTestActor()));
console.log("alias:", JSON.stringify(get2()));
