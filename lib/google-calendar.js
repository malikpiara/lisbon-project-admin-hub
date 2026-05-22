const API_BASE = "https://www.googleapis.com/calendar/v3";

export async function fetchUpcomingEvents({ calendarId, apiKey, maxResults = 20, daysAhead = 90 } = {}) {
  const id = calendarId ?? process.env.GOOGLE_CALENDAR_ID;
  const key = apiKey ?? process.env.GOOGLE_CALENDAR_API_KEY;

  if (!id || !key) {
    throw new Error("Missing GOOGLE_CALENDAR_ID or GOOGLE_CALENDAR_API_KEY");
  }

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

  const url = new URL(`${API_BASE}/calendars/${encodeURIComponent(id)}/events`);
  url.searchParams.set("key", key);
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", String(maxResults));

  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Calendar API ${res.status}: ${body}`);
  }

  const data = await res.json();
  return (data.items ?? []).map(normalizeEvent);
}

function normalizeEvent(item) {
  const allDay = Boolean(item.start?.date);

  return {
    id: item.id,
    title: item.summary ?? "(no title)",
    description: item.description ?? "",
    location: item.location ?? "",
    htmlLink: item.htmlLink,
    allDay,
    start: item.start?.dateTime ?? item.start?.date,
    end: item.end?.dateTime ?? item.end?.date,
  };
}

export function parseEventDate(value, allDay) {
  if (allDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}
