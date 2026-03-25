// --- V3 Telemetry Specification Alignment ---
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { UAParser } from "ua-parser-js";

// FingerprintJS initialization
window.__FINGERPRINT_CONTEXT__ = {
  ready: false,
  data: null,
};

declare global {
  interface Window {
    __FINGERPRINT_CONTEXT__: any;
    __RESPONSE_TIMERS__?: Record<
      string,
      {
        startTime?: number;
        networkStartTime?: number;
        networkEndTime?: number;
        renderStart?: number;
        paintTime?: number;
        responseStart?: number;
        responseEnd?: number;
      }
    >;
  }
}

window.__RESPONSE_TIMERS__ = window.__RESPONSE_TIMERS__ || {};

// Telemetry user data
const telemetryData: {
  mobile: string;
  username: string;
  email: string;
  role: string;
  farmer_id: string;
  unique_id: string;
  registered_location: { district: string; village: string; taluka: string; lgd_code: string };
  device_location: { district: string; village: string; taluka: string; lgd_code: string };
  agristack_location: { district: string; village: string; taluka: string; lgd_code: string };
} = {
  mobile: '',
  username: '',
  email: '',
  role: '',
  farmer_id: '',
  unique_id: '',
  registered_location: { district: '', village: '', taluka: '', lgd_code: '' },
  device_location: { district: '', village: '', taluka: '', lgd_code: '' },
  agristack_location: { district: '', village: '', taluka: '', lgd_code: '' }
};

export const setTelemetryUserData = (userData: any) => {
  telemetryData.mobile = userData.mobile || '';
  telemetryData.username = userData.username || '';
  telemetryData.email = userData.email || '';
  telemetryData.role = userData.role || '';
  telemetryData.farmer_id = userData.farmer_id || '';
  telemetryData.unique_id = userData.unique_id !== undefined ? String(userData.unique_id) : '';
  
  if (Array.isArray(userData.locations)) {
    userData.locations.forEach((location: any) => {
      const locData = {
        district: location.district || '',
        village: location.village || '',
        taluka: location.taluka || '',
        lgd_code: location.lgd_code !== undefined ? String(location.lgd_code) : ''
      };
      
      if (location.location_type === 'registered_location') telemetryData.registered_location = locData;
      else if (location.location_type === 'device_location') telemetryData.device_location = locData;
      else if (location.location_type === 'agristack_location') telemetryData.agristack_location = locData;
    });
  }
};

// Performance observer for chat API calls
// Singleton to prevent multiple observers
let performanceObserverInitialized = false;

export const initChatApiPerformanceObserver = () => {
  if (performanceObserverInitialized) return;
  if (!("PerformanceObserver" in window)) return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "resource" && entry.name.includes("/api/chat/")) {
        // Attach timing to the latest unanswered question
        const timers = window.__RESPONSE_TIMERS__;
        if (!timers) return;

        const latestQid = Object.keys(timers)
          .reverse()
          .find((qid) => timers[qid]?.startTime && !timers[qid]?.responseEnd);

        if (!latestQid) return;

        const timer = timers[latestQid];
        if (!timer) return;

        // Cast to PerformanceResourceTiming to access responseStart/responseEnd
        const resourceTiming = entry as PerformanceResourceTiming;

        // Store responseStart (TTFB - Time To First Byte) and responseEnd
        timer.responseStart = resourceTiming.responseStart;
        timer.responseEnd = resourceTiming.responseEnd;
        
        notifyResponseDataReady(latestQid);
      }
    }
  });

  observer.observe({ type: "resource", buffered: true });
  performanceObserverInitialized = true;
};

// Device code helpers
const mapBrowserCode = (name = "") =>
  ({ chrome: "CH", firefox: "FF", safari: "SF", edge: "ED" })[name.toLowerCase()] || "OT";

const mapOSCode = (name = "") =>
  ({ windows: "WIN", macos: "MAC", android: "AND", ios: "IOS", linux: "LNX" })[name.toLowerCase()] || "OT";

const mapDeviceCode = (type = "") =>
  ({ mobile: "MB", tablet: "TB", desktop: "DT" })[type?.toLowerCase()] || "DT";

declare let Telemetry: any;
declare let AuthTokenGenerate: any;

const getHostUrl = (): string => typeof window !== 'undefined' ? window.location.origin : 'unknown-host';

// Initialize fingerprint and UAParser
const initFingerprintContext = async (sessionStartAt: number) => {
  const cached = localStorage.getItem("fingerprint_context");

  if (cached) {
    window.__FINGERPRINT_CONTEXT__ = JSON.parse(cached);
    if (window.__FINGERPRINT_CONTEXT__) {
      window.__FINGERPRINT_CONTEXT__.ready = true;
    }
    return;
  }

  const fp = await FingerprintJS.load();
  const result = await fp.get();
  const ua = new UAParser().getResult();

  const context = {
    ready: true,
    data: {
      device_id: result.visitorId,
      browser: {
        code: mapBrowserCode(ua.browser.name),
        name: ua.browser.name,
        version: ua.browser.version,
      },
      device: {
        code: mapDeviceCode(ua.device.type),
        name: ua.device.type || "Desktop",
        model: ua.device.model || "Unknown",
      },
      os: {
        code: mapOSCode(ua.os.name),
        name: ua.os.name,
        version: ua.os.version,
      },
      session: {
        session_start_at: sessionStartAt,
        session_end_at: null,
      },
      device_lifecycle: {
        first_seen_at: sessionStartAt,
        last_seen_at: sessionStartAt,
      },
    },
  };

  localStorage.setItem("fingerprint_context", JSON.stringify(context));
  window.__FINGERPRINT_CONTEXT__ = context;
};

export const startTelemetry = async (
  sessionId: string,
  userDetailsObj: { preferred_username: string; email: string },
) => {
  if (typeof Telemetry === 'undefined') return;
  
  const sessionStartAt = Date.now();

  await initFingerprintContext(sessionStartAt);
  initChatApiPerformanceObserver();

  const key = "gyte5565fdbgbngfnhgmnhmjgm,jm,";
  const secret = "gnjhgjugkk";
  const config = {
    pdata: { id: "BharatVistaar", ver: "v0.1", pid: "BharatVistaar" },
    channel: "BharatVistaar-" + getHostUrl(),
    sid: sessionId,
    uid: userDetailsObj['preferred_username'] || "DEFAULT-USER",
    did: userDetailsObj['email'] || "DEFAULT-USER",
    authtoken: AuthTokenGenerate.generate(key, secret),
    host: "/observability-service",
  };

  Telemetry.start(config, "content_id", "contetn_ver", {}, {});
};

export const markServerRequestStart = (qid: string) => {
  window.__RESPONSE_TIMERS__![qid] = {
    startTime: performance.now(),
  };
};

export const markAnswerRendered = (qid: string, callback?: () => void) => {
  requestAnimationFrame(() => {
    const timer = window.__RESPONSE_TIMERS__?.[qid];
    if (!timer) return;

    timer.paintTime = performance.now();
    console.log("PAINT RECORDED", qid, timer);

    notifyResponseDataReady(qid);

    if (callback) callback();
  });
};

export const logQuestionEvent = (questionId: string, sessionId: string, questionText: string) => {
  if (typeof Telemetry === 'undefined') return;
  const target = {
    "id": "default", "ver": "v0.1", "type": "Question",
    "parent": { "id": "p1", "type": "default" },
    "questionsDetails": { "questionText": questionText, "sessionId": sessionId }
  };
  Telemetry.response({ qid: questionId, type: "CHOOSE", target, sid: sessionId, channel: "BharatVistaar-" + getHostUrl() });
};

export const logResponseEvent = (questionId: string, sessionId: string, questionText: string, responseText: string) => {
  if (typeof Telemetry === 'undefined') return;
  
  // Calculate performance metrics
  const timer = window.__RESPONSE_TIMERS__?.[questionId];
  const serverResponseTime =
    timer?.responseEnd && timer?.responseStart
      ? Math.round(timer.responseEnd - timer.responseStart)
      : null;
  const browserRenderTime =
    timer?.paintTime && timer?.responseEnd
      ? Math.round(timer.paintTime - timer.responseEnd)
      : null;

  const target = {
    "id": "default", "ver": "v0.1", "type": "QuestionResponse",
    "parent": { "id": "p1", "type": "default" },
    "questionsDetails": { "questionText": questionText, "answerText": responseText, "sessionId": sessionId },
    "performance": {
      server_response_time_ms: serverResponseTime,
      browser_render_time_ms: browserRenderTime,
    }
  };
  Telemetry.response({ qid: questionId, type: "CHOOSE", target, sid: sessionId, channel: "BharatVistaar-" + getHostUrl() });
};

export const logErrorEvent = (questionId: string, sessionId: string, error: string) => {
  if (typeof Telemetry === 'undefined') return;
  const target = {
    "id": "default", "ver": "v0.1", "type": "Error",
    "parent": { "id": "p1", "type": "default" },
    "errorDetails": { "errorText": error, "sessionId": sessionId }
  };  
  Telemetry.response({ qid: questionId, type: "CHOOSE", target, sid: sessionId, channel: "BharatVistaar-" + getHostUrl() });
};

export const logFeedbackEvent = (questionId: string, sessionId: string, feedbackText: string, feedbackType: string, questionText: string, responseText: string) => {
  if (typeof Telemetry === 'undefined') return;
  const target = {
    "id": "default", "ver": "v0.1", "type": "Feedback",
    "parent": { "id": "p1", "type": "default" },
    "feedbackDetails": { feedbackText, sessionId, questionText, answerText: responseText, feedbackType }
  };
  Telemetry.response({ qid: questionId, type: "CHOOSE", target, sid: sessionId, channel: "BharatVistaar-" + getHostUrl() });
};

export const endTelemetry = () => {
  if (typeof Telemetry !== 'undefined') Telemetry.end({});
};

// Track when response data is ready for each question
const responseDataReady: Map<string, Promise<void>> = new Map();

// Call this from PerformanceObserver when response data arrives
export const notifyResponseDataReady = (qid: string) => {
  if (!responseDataReady.has(qid)) {
    let resolve: () => void;
    const promise = new Promise<void>((res) => {
      resolve = res;
    });
    responseDataReady.set(qid, promise);
    resolve!();
  } else {
    responseDataReady.get(qid);
  }
};

export const endTelemetryWithWait = async (qid: string, timeout = 3000) => {
  const startWait = Date.now();

  const timer = window.__RESPONSE_TIMERS__?.[qid];
  if (timer?.responseEnd && timer?.paintTime) {
    console.log(`Response data already captured for ${qid}`);
    Telemetry.end({});
    return;
  }

  try {
    const readyPromise =
      responseDataReady.get(qid) ||
      new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          const t = window.__RESPONSE_TIMERS__?.[qid];
          if (t?.responseEnd && t?.paintTime) {
            clearInterval(checkInterval);
            console.log(`Response data arrived for ${qid}`);
            resolve();
          }
          if (Date.now() - startWait > timeout) {
            clearInterval(checkInterval);
            console.warn(`Timeout waiting for response data for ${qid}`);
            resolve();
          }
        }, 100);
      });

    await Promise.race([
      readyPromise,
      new Promise<void>((resolve) => setTimeout(resolve, timeout)),
    ]);
  } catch (error) {
    console.warn(`Error waiting for response data: ${error}`);
  }

  Telemetry.end({});
  responseDataReady.delete(qid);
};

export const getServerResponseTime = (qid: string): number | null => {
  const timer = window.__RESPONSE_TIMERS__?.[qid];
  if (!timer || !timer.responseStart || !timer.responseEnd) return null;
  return timer.responseEnd - timer.responseStart;
};

export const getBrowserRenderTime = (qid: string): number | null => {
  const timer = window.__RESPONSE_TIMERS__?.[qid];
  if (!timer || !timer.responseEnd || !timer.paintTime) return null;
  return timer.paintTime - timer.responseEnd;
};

export const getTotalResponseTime = (qid: string): number | null => {
  const timer = window.__RESPONSE_TIMERS__?.[qid];
  if (!timer || !timer.startTime || !timer.paintTime) return null;
  return timer.paintTime - timer.startTime;
};

export const getNetworkWaitTime = (qid: string): number | null => {
  const timer = window.__RESPONSE_TIMERS__?.[qid];
  if (!timer || !timer.startTime || !timer.responseStart) return null;
  return timer.responseStart - timer.startTime;
};

export const getTimingMetrics = (qid: string) => {
  return {
    serverResponseTime: getServerResponseTime(qid),
    browserRenderTime: getBrowserRenderTime(qid),
    totalResponseTime: getTotalResponseTime(qid),
    networkWaitTime: getNetworkWaitTime(qid),
    rawTimers: window.__RESPONSE_TIMERS__?.[qid],
  };
};
