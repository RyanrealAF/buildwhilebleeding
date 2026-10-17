/**
 * BuildWhileBleeding — Master Umbrella _worker.js
 * Cloudflare Pages Advanced Mode (public/_worker.js)
 *
 * Acts as the front-door reverse proxy for all sub-territories.
 * Routes subpaths to their respective .pages.dev deployments,
 * enforces trailing-slash redirects for relative-asset safety,
 * and intercepts cross-project service worker registrations.
 */

// ── Project routing table ──────────────────────────────────────────────
const PROJECTS = {
  "/hardwire":        "https://the-hardwire-method.pages.dev",
  "/the-leak-report": "https://the-leak-report.pages.dev",
  "/theleakreport":   "https://the-leak-report.pages.dev",
  "/cartography":     "https://cartography.pages.dev",
  "/mosaic":          "https://the-mosaic-theory.pages.dev",
  "/mosaic-theory":    "https://the-mosaic-theory.pages.dev",
  "/library/seuss":   "https://the-seuss-library.pages.dev",
  "/im-the-proof":    "https://im-the-proof.pages.dev",
};

// ── Paths that require a trailing slash for relative asset resolution ───
const TRAILING_SLASH_REQUIRED = [
  "/hardwire",
  "/the-leak-report",
  "/theleakreport",
  "/mosaic",
  "/mosaic-theory",
  "/library/seuss",
  "/cartography",
  "/im-the-proof",
];

// ── Helper: find the matching project prefix for a pathname ─────────────
function findProject(pathname) {
  const sortedKeys = Object.keys(PROJECTS).sort((a, b) => b.length - a.length);
  for (const prefix of sortedKeys) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return prefix;
    }
  }
  return null;
}

// ── Helper: check if pathname needs trailing slash redirect ────────────
function needsTrailingSlash(pathname) {
  for (const prefix of TRAILING_SLASH_REQUIRED) {
    if (pathname === prefix) return prefix + "/";
    if (pathname.startsWith(prefix + "/")) {
      const subPath = pathname.slice(prefix.length + 1);
      const lastSegment = subPath.split("/").pop();
      if (lastSegment && !lastSegment.includes(".") && !pathname.endsWith("/")) {
        return pathname + "/";
      }
    }
  }
  return null;
}

// ══════════════════════════════════════════════════════════════════════
// JESTER GENERATION API — async job pipeline
//
// The Jester (Ring My Bell) frontend is a static SPA. Show generation
// runs as an async job: the client POSTs, gets a jobId immediately, then
// polls for progress. A Queue consumer runs the Gemini agent orchestration
// (research → script → TTS → music → mix → metadata → cover), stores the
// finished files in R2, and records status in KV.
//
// Bindings required on the Pages project:
//   JESTER_JOBS  (KV)     — job records + event logs
//   JESTER_SHOWS (R2)     — finished mp3 / cover / notes per job
//   JESTER_QUEUE (Queue)  — job dispatch to the consumer below
// Secrets: GEMINI_API_KEY
// ══════════════════════════════════════════════════════════════════════

const JESTER_API_BASE = "https://generativelanguage.googleapis.com/v1beta";
const JESTER_REPO = "RyanrealAF/Jester";
const JESTER_AGENT = "antigravity-preview-05-2026";
const JESTER_JOB_TTL = 7 * 24 * 3600; // 7 days
const JESTER_DAILY_QUOTA = 5;

function jesterJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function jesterJobId() {
  const b = new Uint8Array(12);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

// ── API router (called from fetch before the project proxy) ─────────────
async function handleJesterApi(request, env) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method.toUpperCase();

  if (pathname === "/api/health" && method === "GET") {
    return jesterJson({ ok: true, service: "jester-gen" });
  }

  if (pathname === "/api/generate-show" && method === "POST") {
    return submitJesterJob(request, env);
  }

  const m = pathname.match(/^\/api\/jobs\/([A-Za-z0-9_-]+)(\/(audio|cover|notes|cancel))?$/);
  if (m) {
    const jobId = m[1];
    const action = m[3];
    if (!action && method === "GET") return getJesterJob(env, jobId, url.searchParams);
    if (action === "cancel" && method === "POST") return cancelJesterJob(env, jobId);
    if (action && method === "GET") return serveJesterFile(env, jobId, action);
  }

  // Legacy cancel endpoint (older frontend)
  if (pathname === "/api/cancel-show" && method === "POST") {
    try {
      const body = await request.json();
      if (body && body.generationId) return cancelJesterJob(env, String(body.generationId));
    } catch (_) {}
    return jesterJson({ ok: true });
  }

  return new Response("Not found", { status: 404 });
}

async function submitJesterJob(request, env) {
  if (!env.JESTER_JOBS || !env.JESTER_QUEUE || !env.JESTER_SHOWS) {
    return jesterJson({ error: "Generation backend not configured (missing KV/R2/Queue bindings)." }, 503);
  }
  if (!env.GEMINI_API_KEY) {
    return jesterJson({ error: "Generation backend missing API key." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch (_) {
    return jesterJson({ error: "Invalid JSON body." }, 400);
  }

  // Simple IP-based daily quota (shared free-tier key protection)
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const quotaKey = `jester:quota:${day}:${ip}`;
  const used = parseInt((await env.JESTER_JOBS.get(quotaKey)) || "0", 10);
  if (used >= JESTER_DAILY_QUOTA) {
    return jesterJson({ error: `Daily limit of ${JESTER_DAILY_QUOTA} shows reached. Please check back tomorrow!` }, 429);
  }

  const topic = body.topic && String(body.topic).trim() ? String(body.topic).trim() : "";
  const fileName = body.fileName ? String(body.fileName) : null;
  const fileContent = body.fileContent ? String(body.fileContent) : null;

  const jobId = jesterJobId();
  const job = {
    id: jobId,
    status: "queued",
    topic,
    duration: String(body.duration || "3"),
    mood: String(body.mood || "Mischievous & Rigorous"),
    fileName,
    fileContent,
    createdAt: Date.now(),
    events: [],
  };
  await env.JESTER_JOBS.put(`jester:job:${jobId}`, JSON.stringify(job), { expirationTtl: JESTER_JOB_TTL });
  await env.JESTER_JOBS.put(quotaKey, String(used + 1), { expirationTtl: 86400 });
  await env.JESTER_QUEUE.send({ jobId });

  return jesterJson({ jobId }, 202);
}

async function getJesterJob(env, jobId, params) {
  const job = await env.JESTER_JOBS.get(`jester:job:${jobId}`, "json");
  if (!job) return jesterJson({ error: "Job not found." }, 404);
  const since = Math.max(0, parseInt(params.get("since") || "0", 10) || 0);
  const events = Array.isArray(job.events) ? job.events : [];
  // Never leak the uploaded source content or prompt through the poll endpoint
  const { fileContent, ...safe } = job;
  return jesterJson({
    ...safe,
    events: events.slice(since),
    total: events.length,
  });
}

async function cancelJesterJob(env, jobId) {
  const key = `jester:job:${jobId}`;
  const job = await env.JESTER_JOBS.get(key, "json");
  if (!job) return jesterJson({ error: "Job not found." }, 404);
  if (job.status === "queued" || job.status === "running") {
    job.status = "cancelled";
    job.events.push({ type: "error", message: "Generation cancelled by user." });
    await env.JESTER_JOBS.put(key, JSON.stringify(job), { expirationTtl: JESTER_JOB_TTL });
  }
  return jesterJson({ ok: true, status: job.status });
}

async function serveJesterFile(env, jobId, kind) {
  const names = {
    audio: { key: `jobs/${jobId}/ai_radio.mp3`, type: "audio/mpeg" },
    cover: { key: `jobs/${jobId}/cover.png`, type: "image/png" },
    notes: { key: `jobs/${jobId}/show_notes.json`, type: "application/json" },
  };
  const n = names[kind];
  if (!n) return new Response("Not found", { status: 404 });
  let obj = await env.JESTER_SHOWS.get(n.key);
  // Cover may have been stored as jpg
  if (!obj && kind === "cover") {
    obj = await env.JESTER_SHOWS.get(`jobs/${jobId}/cover.jpg`);
  }
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || n.type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

// ── Queue consumer: runs one generation job ─────────────────────────────
async function processJesterJob(env, jobId) {
  const key = `jester:job:${jobId}`;
  let job = await env.JESTER_JOBS.get(key, "json");
  if (!job || job.status === "cancelled" || job.status === "complete" || job.status === "failed") {
    return; // nothing to do (or redelivery after finish)
  }

  const saveJob = (j) => env.JESTER_JOBS.put(key, JSON.stringify(j), { expirationTtl: JESTER_JOB_TTL });

  job.status = "running";
  job.startedAt = Date.now();
  await saveJob(job);

  const eventBuffer = [];
  let lastFlush = Date.now();
  const aborter = new AbortController();

  const flushEvents = async () => {
    if (eventBuffer.length === 0) return;
    const j = await env.JESTER_JOBS.get(key, "json");
    if (!j) return;
    if (j.status === "cancelled") {
      aborter.abort();
      return;
    }
    j.events.push(...eventBuffer.splice(0));
    // Cap the log so one runaway job can't blow the KV value limit
    if (j.events.length > 2000) j.events = j.events.slice(-2000);
    await saveJob(j);
    lastFlush = Date.now();
  };
  const pushEvent = (e) => {
    eventBuffer.push(e);
    if (eventBuffer.length >= 25 || Date.now() - lastFlush > 5000) {
      // fire-and-forget is unsafe here; await it
      return flushEvents();
    }
    return Promise.resolve();
  };

  const fail = async (message) => {
    await flushEvents();
    const j = (await env.JESTER_JOBS.get(key, "json")) || job;
    j.status = "failed";
    j.error = message;
    j.events.push({ type: "error", message });
    await saveJob(j);
  };

  try {
    const fileName = job.fileName;
    const fileContent = job.fileContent;
    const sanitized = fileName ? fileName.replace(/[^a-zA-Z0-9._-]/g, "_") : null;
    const effectiveTopic =
      job.topic || (fileName ? `Deep-dive analysis of uploaded document: ${fileName}` : "Current events and tech debates");

    let prompt =
      `Generate a radio station about: ${effectiveTopic}. Target duration: ${job.duration} minutes. ` +
      `Set the tone and style of the show to: ${job.mood}. Follow the workflow in AGENTS.md to thoroughly research the topic, ` +
      `perform a deep pre-show editorial deconstruction of the source material (fact matrix, conflict map, and caller dossier in ` +
      `workspace/data/editorial_analysis.md), write the dialogue script in workspace/data/script.md, generate speech and music, ` +
      `mix the audio, and generate the metadata. Put substantial critical thought into the arguments, claims, second-order ` +
      `consequences, and counterpoints before synthesizing the script.`;

    await pushEvent({
      type: "info",
      message: fileName ? `Provisioning environment with uploaded file "${fileName}"...` : "Provisioning environment...",
    });

    // Agent skill files (cached in KV for a day so every job doesn't hit GitHub)
    const agentFiles = await loadJesterAgentFiles(env);

    if (fileName && fileContent && sanitized) {
      const mdTarget = sanitized.endsWith(".md") ? sanitized : `${sanitized}.md`;
      prompt +=
        `\n\nCRITICAL UPLOADED SOURCE MATERIAL: The user uploaded an official source file named "${fileName}". ` +
        `Its content is placed directly in workspace/data/research/${mdTarget}. You MUST examine this document with deep analytical ` +
        `thought during the research and editorial steps, extracting hard facts, core tensions, and technical mechanisms to ground ` +
        `the Jester's arguments, caller pushback, and quotes directly on this material.`;
      agentFiles.push({ type: "inline", content: fileContent, target: `/workspace/data/research/${mdTarget}` });
      agentFiles.push({ type: "inline", content: fileContent, target: `/.agents/data/research/${mdTarget}` });
    }

    const payload = {
      agent: JESTER_AGENT,
      input: [{ type: "text", text: prompt }],
      stream: true,
      environment: {
        type: "remote",
        sources: agentFiles,
        network: {
          allowlist: [
            { domain: "generativelanguage.googleapis.com", transform: { "x-goog-api-key": env.GEMINI_API_KEY } },
            { domain: "*" },
          ],
        },
      },
    };

    const apiRes = await fetch(`${JESTER_API_BASE}/interactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
        "x-server-timeout": "600",
        "Api-Revision": "2026-05-20",
        "x-goog-api-client": "applet-ai-radio/1.0.0",
      },
      body: JSON.stringify(payload),
      signal: aborter.signal,
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      let msg = `Agent API error: ${apiRes.status} - ${errText}`;
      try {
        const p = JSON.parse(errText);
        if (p?.error?.message) msg = p.error.message;
      } catch (_) {}
      if (/quota|too_many_requests|resource_exhausted/i.test(msg)) {
        msg = `Gemini API quota reached: ${msg}`;
      }
      await fail(msg);
      return;
    }

    let envId;
    let accumulatedText = "";
    for await (const event of parseJesterStream(apiRes)) {
      if (event.type === "done") break;
      if (event.type === "complete") {
        envId = event.interaction?.environment?.env_id || event.interaction?.environment_id;
      }
      await pushEvent(event);
      if (event.type === "text" && event.text) accumulatedText += event.text;
      if (aborter.signal.aborted) {
        await fail("Generation cancelled by user.");
        return;
      }
    }

    if (!envId) {
      await fail("The agent finished without producing a show environment.");
      return;
    }

    await pushEvent({ type: "info", message: "Processing final audio and metadata..." });
    await flushEvents();

    const dlRes = await fetch(`${JESTER_API_BASE}/files/environment-${envId}:download?alt=media`, {
      headers: { "x-goog-api-key": env.GEMINI_API_KEY },
      signal: aborter.signal,
    });
    if (!dlRes.ok) {
      await fail(`Failed to retrieve show files: ${await dlRes.text()}`);
      return;
    }

    const tarBytes = new Uint8Array(await dlRes.arrayBuffer());
    const files = extractJesterTar(tarBytes);

    let showNotes = null;
    let audioBytes = null;
    let coverBytes = null;
    let coverName = "cover.png";
    let editorial = "";
    for (const [p, bytes] of Object.entries(files)) {
      if (p.endsWith("show_notes.json")) {
        try {
          showNotes = JSON.parse(new TextDecoder().decode(bytes));
        } catch (_) {}
      } else if (p.endsWith("ai_radio.mp3")) {
        audioBytes = bytes;
      } else if (/cover\.(png|jpg|jpeg)$/.test(p)) {
        coverBytes = bytes;
        coverName = p.endsWith(".png") ? "cover.png" : "cover.jpg";
      } else if (p.endsWith("editorial_analysis.md")) {
        editorial = new TextDecoder().decode(bytes);
      }
    }

    if (!showNotes) {
      await fail("Show archive was missing show_notes.json.");
      return;
    }
    if (!audioBytes) {
      await fail("Show archive was missing the final audio (ai_radio.mp3).");
      return;
    }

    if (editorial && !showNotes.editorial_analysis) showNotes.editorial_analysis = editorial;
    showNotes.audioUrl = `/api/jobs/${jobId}/audio`;
    if (coverBytes) showNotes.coverImage = `/api/jobs/${jobId}/cover`;

    await env.JESTER_SHOWS.put(`jobs/${jobId}/ai_radio.mp3`, audioBytes, { httpMetadata: { contentType: "audio/mpeg" } });
    if (coverBytes) {
      await env.JESTER_SHOWS.put(`jobs/${jobId}/${coverName}`, coverBytes, {
        httpMetadata: { contentType: coverName.endsWith(".png") ? "image/png" : "image/jpeg" },
      });
    }
    await env.JESTER_SHOWS.put(`jobs/${jobId}/show_notes.json`, JSON.stringify(showNotes), {
      httpMetadata: { contentType: "application/json" },
    });

    await flushEvents();
    const j = (await env.JESTER_JOBS.get(key, "json")) || job;
    j.status = "complete";
    j.completedAt = Date.now();
    j.events.push({ type: "show_data", data: showNotes });
    j.events.push({ type: "status", status: "completed" });
    // Drop the bulky source content now that the job is done
    delete j.fileContent;
    await saveJob(j);
  } catch (err) {
    if (err && err.name === "AbortError") {
      await fail("Generation cancelled by user.");
    } else {
      await fail(err instanceof Error ? err.message : "Unknown error");
    }
  }
}

// ── Agent skill files, fetched from the Jester repo and cached in KV ────
async function loadJesterAgentFiles(env) {
  const cacheKey = "jester:agent-files";
  try {
    const cached = await env.JESTER_JOBS.get(cacheKey, "json");
    if (cached && cached.length) return cached.slice(); // copy; caller may push
  } catch (_) {}

  const files = [];
  // Discover every file under agent/ via the git tree API
  const treeRes = await fetch(`https://api.github.com/repos/${JESTER_REPO}/git/trees/main?recursive=1`, {
    headers: { "User-Agent": "bwb-jester-worker", Accept: "application/vnd.github+json" },
  });
  if (!treeRes.ok) throw new Error(`Could not list agent files (GitHub ${treeRes.status}).`);
  const tree = await treeRes.json();
  const agentPaths = (tree.tree || [])
    .filter((n) => n.type === "blob" && n.path.startsWith("agent/"))
    .map((n) => n.path);

  for (const p of agentPaths) {
    const r = await fetch(`https://raw.githubusercontent.com/${JESTER_REPO}/main/${p}`);
    if (!r.ok) continue;
    const content = await r.text();
    files.push({ type: "inline", content, target: `/.agents/${p.slice("agent/".length)}` });
  }
  // The workflow prompt references the repo-root AGENTS.md
  try {
    const r = await fetch(`https://raw.githubusercontent.com/${JESTER_REPO}/main/AGENTS.md`);
    if (r.ok) files.push({ type: "inline", content: await r.text(), target: "/.agents/AGENTS.md" });
  } catch (_) {}

  if (files.length) {
    try {
      await env.JESTER_JOBS.put(cacheKey, JSON.stringify(files), { expirationTtl: 86400 });
    } catch (_) {}
  }
  return files;
}

// ── SSE parsing for the Gemini interactions stream ──────────────────────
async function* parseJesterStream(response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const part of parts) {
      for (const line of part.split("\n")) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const dataStr = t.slice(5).trim();
        if (!dataStr || dataStr === "[DONE]") continue;
        try {
          yield JSON.parse(dataStr);
        } catch (_) {}
      }
    }
  }
}

// ── In-memory TAR extraction (ported from the Express server) ───────────
function extractJesterTar(tarBytes) {
  const files = {};
  let offset = 0;
  while (offset + 512 <= tarBytes.length) {
    let isEnd = true;
    for (let i = 0; i < 512; i++) {
      if (tarBytes[offset + i] !== 0) {
        isEnd = false;
        break;
      }
    }
    if (isEnd) break;

    let name = "";
    for (let i = 0; i < 100; i++) {
      const c = tarBytes[offset + i];
      if (c === 0) break;
      name += String.fromCharCode(c);
    }
    name = name.trim();

    let sizeStr = "";
    for (let i = 124; i < 136; i++) {
      const c = tarBytes[offset + i];
      if (c === 0 || c === 32) continue;
      sizeStr += String.fromCharCode(c);
    }
    const size = parseInt(sizeStr, 8);
    const typeflag = tarBytes[offset + 156];
    const isRegular = typeflag === 0 || typeflag === 48;

    offset += 512;
    if (name && isRegular && !isNaN(size) && size > 0 && offset + size <= tarBytes.length) {
      files[name] = tarBytes.subarray(offset, offset + size);
    }
    offset += Math.ceil(size / 512) * 512;
  }
  return files;
}

// ── Main fetch handler ─────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // ── 1. Service Worker no-op interceptor ─────────────────────────────
    if (pathname.endsWith("/sw.js")) {
      return new Response(
        `/* no-op service worker */
        self.addEventListener("install", (e) => self.skipWaiting());
        self.addEventListener("activate", (e) => {
          self.registration.unregister();
          e.waitUntil(clients.claim());
        });`,
        {
          status: 200,
          headers: { "Content-Type": "application/javascript; charset=utf-8",
                     "Cache-Control": "no-store, no-cache, must-revalidate",
                     "Service-Worker-Allowed": "/" },
        }
      );
    }

    // ── 2. Trailing-slash enforcement (308 permanent redirect) ─────────
    // ── 1b. Jester generation API (async jobs) ──────────────────────────
    if (pathname === "/api/health" || pathname === "/api/generate-show" ||
        pathname.startsWith("/api/jobs") || pathname === "/api/cancel-show") {
      return handleJesterApi(request, env);
    }

    const slashRedirect = needsTrailingSlash(pathname);
    if (slashRedirect) {
      const redirectUrl = new URL(slashRedirect, url.origin);
      redirectUrl.search = url.search;
      return Response.redirect(redirectUrl.toString(), 308);
    }

    // ── 3. Project reverse-proxy routing ───────────────────────────────
    const projectPrefix = findProject(pathname);
    if (projectPrefix) {
      const upstream = PROJECTS[projectPrefix];
      const subPath = pathname.slice(projectPrefix.length) || "/";
      const proxyUrl = new URL(subPath, upstream);
      proxyUrl.search = url.search;

      const proxyRequest = new Request(proxyUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual",
      });

      const response = await fetch(proxyRequest);

      const newHeaders = new Headers(response.headers);
      const location = newHeaders.get("Location");
      if (location) {
        try {
          const locUrl = new URL(location, upstream);
          const upstreamOrigin = new URL(upstream).origin;
          const isUpstreamRedirect =
            locUrl.origin === upstreamOrigin ||
            locUrl.hostname.endsWith(".pages.dev") ||
            locUrl.hostname === "buildwhilebleeding.com" ||
            locUrl.hostname === "www.buildwhilebleeding.com";

          if (isUpstreamRedirect) {
            const localPath = locUrl.pathname === "/" ? projectPrefix + "/" : projectPrefix + locUrl.pathname;
            const localUrl = new URL(localPath, url.origin);
            localUrl.search = locUrl.search;
            localUrl.hash = locUrl.hash;
            newHeaders.set("Location", localUrl.toString());
          }
        } catch (_) {}
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // ── 4. Fallback: serve static assets from the Pages project itself ──
    return env.ASSETS.fetch(request);
  },

  // ── Queue consumer: runs Jester generation jobs in the background ───
  async queue(batch, env) {
    for (const msg of batch.messages) {
      const jobId = msg.body && msg.body.jobId;
      try {
        if (jobId) await processJesterJob(env, jobId);
        msg.ack();
      } catch (err) {
        console.error(`[jester] job ${jobId} failed:`, err && err.message);
        try {
          const key = `jester:job:${jobId}`;
          const job = await env.JESTER_JOBS.get(key, "json");
          if (job && job.status !== "complete") {
            job.status = "failed";
            job.error = err instanceof Error ? err.message : "Unknown error";
            (job.events = job.events || []).push({ type: "error", message: job.error });
            await env.JESTER_JOBS.put(key, JSON.stringify(job), { expirationTtl: JESTER_JOB_TTL });
          }
        } catch (_) {}
        msg.ack(); // don't redeliver a poisoned job forever
      }
    }
  },
};
