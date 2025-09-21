// src/runtime.ts
var defaultBaseUrl = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "" : "";
function buildHeaders(initHeaders, token) {
  const headers = new Headers(initHeaders || void 0);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
}
async function authorizedFetcher(url, init) {
  const { token, baseUrl, headers: initHeaders, ...rest } = init || {};
  const headers = buildHeaders(initHeaders, token);
  if (rest.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const resolvedBaseUrl = (baseUrl ?? defaultBaseUrl).replace(/\/$/, "");
  const response = await fetch(`${resolvedBaseUrl}${url}`, {
    ...rest,
    headers,
    credentials: rest.credentials ?? "include"
  });
  if (!response.ok) {
    let errorPayload;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      errorPayload = await response.json().catch(() => void 0);
    } else {
      errorPayload = await response.text().catch(() => void 0);
    }
    const error = new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
    error.status = response.status;
    error.payload = errorPayload;
    throw error;
  }
  if (response.status === 204) {
    return void 0;
  }
  const responseContentType = response.headers.get("content-type") || "";
  if (responseContentType.includes("application/json")) {
    return await response.json();
  }
  return await response.text();
}

// src/clients/openindia.ts
var StudentDetailAllOfTicketsItemStatus = {
  open: "open",
  closed: "closed"
};
var StudentDetailAllOfOfficeHoursItemStatus = {
  scheduled: "scheduled",
  completed: "completed",
  canceled: "canceled"
};
var CourseSearchHitVisibility = {
  public: "public",
  private: "private",
  unlisted: "unlisted"
};
var UpdateCourseRequestVisibility = {
  public: "public",
  private: "private",
  unlisted: "unlisted"
};
var CourseVisibility = {
  public: "public",
  private: "private",
  unlisted: "unlisted"
};
var getLoginUrl = () => {
  return `/api/auth/login`;
};
var login = async (authLoginRequest, options) => {
  return authorizedFetcher(getLoginUrl(), {
    ...options,
    method: "POST",
    body: JSON.stringify(authLoginRequest)
  });
};
var getListCoursesUrl = () => {
  return `/api/courses`;
};
var listCourses = async (options) => {
  return authorizedFetcher(getListCoursesUrl(), {
    ...options,
    method: "GET"
  });
};
var getCreateCourseUrl = () => {
  return `/api/courses`;
};
var createCourse = async (createCourseRequest, options) => {
  return authorizedFetcher(
    getCreateCourseUrl(),
    {
      ...options,
      method: "POST",
      body: JSON.stringify(createCourseRequest)
    }
  );
};
var getUpdateCourseUrl = (id) => {
  return `/api/courses/${id}`;
};
var updateCourse = async (id, updateCourseRequest, options) => {
  return authorizedFetcher(
    getUpdateCourseUrl(id),
    {
      ...options,
      method: "PATCH",
      body: JSON.stringify(updateCourseRequest)
    }
  );
};
var getEnrollInCourseUrl = (id) => {
  return `/api/courses/${id}/enroll`;
};
var enrollInCourse = async (id, options) => {
  return authorizedFetcher(
    getEnrollInCourseUrl(id),
    {
      ...options,
      method: "POST"
    }
  );
};
var getSearchCoursesUrl = (params) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === null) {
      normalizedParams.append(key, "null");
    } else if (value !== void 0) {
      normalizedParams.append(key, value.toString());
    }
  });
  return `/api/courses/search?${normalizedParams.toString()}`;
};
var searchCourses = async (params, options) => {
  return authorizedFetcher(
    getSearchCoursesUrl(params),
    {
      ...options,
      method: "GET"
    }
  );
};
var getListLecturesUrl = () => {
  return `/api/lessons`;
};
var listLectures = async (options) => {
  return authorizedFetcher(
    getListLecturesUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
var getCreateLectureUrl = () => {
  return `/api/lessons`;
};
var createLecture = async (createLectureRequest, options) => {
  return authorizedFetcher(
    getCreateLectureUrl(),
    {
      ...options,
      method: "POST",
      body: JSON.stringify(createLectureRequest)
    }
  );
};
var getSearchLecturesUrl = (params) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === null) {
      normalizedParams.append(key, "null");
    } else if (value !== void 0) {
      normalizedParams.append(key, value.toString());
    }
  });
  return `/api/lessons/search?${normalizedParams.toString()}`;
};
var searchLectures = async (params, options) => {
  return authorizedFetcher(
    getSearchLecturesUrl(params),
    {
      ...options,
      method: "GET"
    }
  );
};
var getReindexSearchUrl = () => {
  return `/api/v1/search/reindex`;
};
var reindexSearch = async (options) => {
  return authorizedFetcher(
    getReindexSearchUrl(),
    {
      ...options,
      method: "POST"
    }
  );
};
var getListJobsUrl = () => {
  return `/api/jobs/outbox`;
};
var listJobs = async (options) => {
  return authorizedFetcher(getListJobsUrl(), {
    ...options,
    method: "GET"
  });
};
var getEnqueueJobUrl = () => {
  return `/api/jobs/outbox`;
};
var enqueueJob = async (enqueueJobRequest, options) => {
  return authorizedFetcher(getEnqueueJobUrl(), {
    ...options,
    method: "POST",
    body: JSON.stringify(enqueueJobRequest)
  });
};
var getGetRiskQueueUrl = (params) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === null) {
      normalizedParams.append(key, "null");
    } else if (value !== void 0) {
      normalizedParams.append(key, value.toString());
    }
  });
  return `/api/v1/ssu/risk?${normalizedParams.toString()}`;
};
var getRiskQueue = async (params, options) => {
  return authorizedFetcher(
    getGetRiskQueueUrl(params),
    {
      ...options,
      method: "GET"
    }
  );
};
var getGetStudentUrl = (id) => {
  return `/api/v1/ssu/students/${id}`;
};
var getStudent = async (id, options) => {
  return authorizedFetcher(getGetStudentUrl(id), {
    ...options,
    method: "GET"
  });
};
var getCreateTicketUrl = (id) => {
  return `/api/v1/ssu/students/${id}/tickets`;
};
var createTicket = async (id, createTicketRequest, options) => {
  return authorizedFetcher(
    getCreateTicketUrl(id),
    {
      ...options,
      method: "POST",
      body: JSON.stringify(createTicketRequest)
    }
  );
};
var getScheduleOfficeHourUrl = (id) => {
  return `/api/v1/ssu/students/${id}/office-hours`;
};
var scheduleOfficeHour = async (id, scheduleOfficeHourRequest, options) => {
  return authorizedFetcher(
    getScheduleOfficeHourUrl(id),
    {
      ...options,
      method: "POST",
      body: JSON.stringify(scheduleOfficeHourRequest)
    }
  );
};
export {
  CourseSearchHitVisibility,
  CourseVisibility,
  StudentDetailAllOfOfficeHoursItemStatus,
  StudentDetailAllOfTicketsItemStatus,
  UpdateCourseRequestVisibility,
  authorizedFetcher,
  createCourse,
  createLecture,
  createTicket,
  enqueueJob,
  enrollInCourse,
  getCreateCourseUrl,
  getCreateLectureUrl,
  getCreateTicketUrl,
  getEnqueueJobUrl,
  getEnrollInCourseUrl,
  getGetRiskQueueUrl,
  getGetStudentUrl,
  getListCoursesUrl,
  getListJobsUrl,
  getListLecturesUrl,
  getLoginUrl,
  getReindexSearchUrl,
  getRiskQueue,
  getScheduleOfficeHourUrl,
  getSearchCoursesUrl,
  getSearchLecturesUrl,
  getStudent,
  getUpdateCourseUrl,
  listCourses,
  listJobs,
  listLectures,
  login,
  reindexSearch,
  scheduleOfficeHour,
  searchCourses,
  searchLectures,
  updateCourse
};
//# sourceMappingURL=index.js.map