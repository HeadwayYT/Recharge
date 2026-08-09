import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders Recharge metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Recharge \| Sleep, Recovery &amp; Energy<\/title>/i);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/i);
});

test("keeps AI-ready product architecture out of the UI layer", async () => {
  const [page, recharge] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/recharge.ts", import.meta.url), "utf8"),
  ]);

  assert.match(page, /analyzeProblem/);
  assert.match(page, /chooseExperiment/);
  assert.match(recharge, /export type ProblemAnalysis/);
  assert.match(recharge, /export type MissingInformation/);
  assert.match(recharge, /export type Experiment/);
  assert.match(recharge, /export type ActiveExperiment/);
  assert.match(recharge, /export type CheckIn/);
  assert.match(recharge, /export type LearnedSignal/);
  assert.match(recharge, /export type NextBestInteraction/);
  assert.match(recharge, /export const experimentLibrary/);
  assert.match(recharge, /professional_evaluation/);
  assert.match(recharge, /do_not_continue_self_coaching/);
  assert.match(recharge, /REQUEST_INFORMATION/);
  assert.match(recharge, /START_EXPERIMENT/);
});
