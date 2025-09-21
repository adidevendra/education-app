type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;
type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<{
        [Q in P]: T[P];
    }, {
        -readonly [Q in P]: T[P];
    }, P>;
}[keyof T];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type DistributeReadOnlyOverUnions<T> = T extends any ? NonReadonly<T> : never;
type Writable<T> = Pick<T, WritableKeys<T>>;
type NonReadonly<T> = [T] extends [UnionToIntersection<T>] ? {
    [P in keyof Writable<T>]: T[P] extends object ? NonReadonly<NonNullable<T[P]>> : T[P];
} : DistributeReadOnlyOverUnions<T>;
type GetRiskQueueParams = {
    /**
     * Free-text search (name/email)
     */
    q?: string;
    /**
     * Minimum risk score inclusive
     */
    min?: number;
    /**
     * Maximum risk score inclusive
     */
    max?: number;
};
type SearchLecturesParams = {
    /**
     * Free text query
     */
    q?: string;
};
type SearchCoursesParams = {
    /**
     * Free text query
     */
    q?: string;
};
interface CreatedResource {
    id: string;
}
interface ScheduleOfficeHourRequest {
    scheduledAt: string;
    with: string;
}
interface CreateTicketRequest {
    body?: string;
    title: string;
}
type StudentDetailAllOfTicketsItemStatus = (typeof StudentDetailAllOfTicketsItemStatus)[keyof typeof StudentDetailAllOfTicketsItemStatus];
declare const StudentDetailAllOfTicketsItemStatus: {
    readonly open: "open";
    readonly closed: "closed";
};
type StudentDetailAllOfTicketsItem = {
    createdAt: string;
    id: string;
    status: StudentDetailAllOfTicketsItemStatus;
    title: string;
};
type StudentDetailAllOfOfficeHoursItemStatus = (typeof StudentDetailAllOfOfficeHoursItemStatus)[keyof typeof StudentDetailAllOfOfficeHoursItemStatus];
declare const StudentDetailAllOfOfficeHoursItemStatus: {
    readonly scheduled: "scheduled";
    readonly completed: "completed";
    readonly canceled: "canceled";
};
type StudentDetailAllOfOfficeHoursItem = {
    id: string;
    scheduledAt: string;
    status: StudentDetailAllOfOfficeHoursItemStatus;
    with: string;
};
type StudentDetailAllOfNotesItem = {
    author: string;
    body: string;
    createdAt: string;
    id: string;
};
type StudentDetailAllOfEnrollmentsItem = {
    course: string;
    courseId: string;
    /**
     * @minimum 0
     * @maximum 100
     */
    progressPct: number;
    startedAt: string;
};
type StudentDetailAllOf = {
    enrollments: StudentDetailAllOfEnrollmentsItem[];
    notes: StudentDetailAllOfNotesItem[];
    officeHours: StudentDetailAllOfOfficeHoursItem[];
    progressVelocity: number;
    tickets: StudentDetailAllOfTicketsItem[];
};
interface RiskStudent {
    /** @nullable */
    course?: string | null;
    email: string;
    id: string;
    name: string;
    /**
     * @minimum 0
     * @maximum 100
     */
    riskScore: number;
}
type StudentDetail = RiskStudent & StudentDetailAllOf;
type EnqueueJobRequestPayload = {
    [key: string]: unknown;
};
interface EnqueueJobRequest {
    payload: EnqueueJobRequestPayload;
    /** @maxLength 128 */
    type: string;
}
type OutboxJobPayload = {
    [key: string]: unknown;
};
interface OutboxJob {
    createdAt: string;
    id: string;
    payload: OutboxJobPayload;
    /** @nullable */
    processedAt?: string | null;
    /** @maxLength 128 */
    type: string;
}
interface ReindexResponse {
    /** @minimum 0 */
    enqueued: number;
    ok: boolean;
}
interface LectureSearchHit {
    id: string;
    moduleId?: string;
    /** @nullable */
    summary?: string | null;
    title: string;
}
type CourseSearchHitVisibility = (typeof CourseSearchHitVisibility)[keyof typeof CourseSearchHitVisibility];
declare const CourseSearchHitVisibility: {
    readonly public: "public";
    readonly private: "private";
    readonly unlisted: "unlisted";
};
interface CourseSearchHit {
    /** @nullable */
    description?: string | null;
    id: string;
    slug?: string;
    tags?: string[];
    title: string;
    visibility?: CourseSearchHitVisibility;
}
interface CreateLectureRequest {
    /** @nullable */
    contentMd?: string | null;
    moduleId: string;
    /** @minimum 0 */
    position: number;
    /** @nullable */
    summary?: string | null;
    title: string;
}
interface Lecture {
    /** @nullable */
    contentMd?: string | null;
    createdAt?: string;
    /**
     * @minimum 1
     * @maximum 14400
     */
    durationSeconds?: number;
    id?: string;
    isPublished?: boolean;
    moduleId: string;
    /** @minimum 0 */
    position: number;
    /**
     * @maxLength 2000
     * @nullable
     */
    summary?: string | null;
    /**
     * @minLength 2
     * @maxLength 160
     */
    title: string;
    updatedAt?: string;
}
interface EnrollmentResponse {
    enrollmentId: string;
    success: boolean;
}
type UpdateCourseRequestVisibility = (typeof UpdateCourseRequestVisibility)[keyof typeof UpdateCourseRequestVisibility];
declare const UpdateCourseRequestVisibility: {
    readonly public: "public";
    readonly private: "private";
    readonly unlisted: "unlisted";
};
interface UpdateCourseRequest {
    /** @nullable */
    description?: string | null;
    estimatedMinutes?: number;
    orgId?: string;
    slug?: string;
    tags?: string[];
    title?: string;
    visibility?: UpdateCourseRequestVisibility;
}
type CreateCourseRequestAllOf = {
    readonly createdAt?: unknown;
    readonly id?: unknown;
    readonly updatedAt?: unknown;
};
type CourseVisibility = (typeof CourseVisibility)[keyof typeof CourseVisibility];
declare const CourseVisibility: {
    readonly public: "public";
    readonly private: "private";
    readonly unlisted: "unlisted";
};
interface Course {
    createdAt?: string;
    /**
     * @maxLength 4000
     * @nullable
     */
    description?: string | null;
    /**
     * @minimum 1
     * @maximum 100000
     */
    estimatedMinutes?: number;
    id?: string;
    orgId: string;
    /**
     * @minLength 3
     * @maxLength 120
     * @pattern ^[a-z0-9-]+$
     */
    slug: string;
    /** @maxItems 20 */
    tags?: string[];
    /**
     * @minLength 3
     * @maxLength 160
     */
    title: string;
    updatedAt?: string;
    visibility?: CourseVisibility;
}
type CreateCourseRequest = Course & CreateCourseRequestAllOf;
interface AuthTokenResponse {
    /** JWT bearer token */
    access_token: string;
}
interface AuthLoginRequest {
    email: string;
    /** @minLength 6 */
    password: string;
}
/**
 * @summary Authenticate a user by email and password
 */
type loginResponse = {
    data: AuthTokenResponse;
    status: number;
};
declare const getLoginUrl: () => string;
declare const login: (authLoginRequest: AuthLoginRequest, options?: RequestInit) => Promise<loginResponse>;
/**
 * @summary List all courses for the current tenant
 */
type listCoursesResponse = {
    data: Course[];
    status: number;
};
declare const getListCoursesUrl: () => string;
declare const listCourses: (options?: RequestInit) => Promise<listCoursesResponse>;
/**
 * @summary Create a new course
 */
type createCourseResponse = {
    data: Course;
    status: number;
};
declare const getCreateCourseUrl: () => string;
declare const createCourse: (createCourseRequest: NonReadonly<CreateCourseRequest>, options?: RequestInit) => Promise<createCourseResponse>;
/**
 * @summary Update a course
 */
type updateCourseResponse = {
    data: Course;
    status: number;
};
declare const getUpdateCourseUrl: (id: string) => string;
declare const updateCourse: (id: string, updateCourseRequest: UpdateCourseRequest, options?: RequestInit) => Promise<updateCourseResponse>;
/**
 * @summary Enroll the active user in a course
 */
type enrollInCourseResponse = {
    data: EnrollmentResponse;
    status: number;
};
declare const getEnrollInCourseUrl: (id: string) => string;
declare const enrollInCourse: (id: string, options?: RequestInit) => Promise<enrollInCourseResponse>;
/**
 * @summary Search published courses
 */
type searchCoursesResponse = {
    data: CourseSearchHit[];
    status: number;
};
declare const getSearchCoursesUrl: (params?: SearchCoursesParams) => string;
declare const searchCourses: (params?: SearchCoursesParams, options?: RequestInit) => Promise<searchCoursesResponse>;
/**
 * @summary List lessons for all courses
 */
type listLecturesResponse = {
    data: Lecture[];
    status: number;
};
declare const getListLecturesUrl: () => string;
declare const listLectures: (options?: RequestInit) => Promise<listLecturesResponse>;
/**
 * @summary Create a lesson under a module
 */
type createLectureResponse = {
    data: Lecture;
    status: number;
};
declare const getCreateLectureUrl: () => string;
declare const createLecture: (createLectureRequest: CreateLectureRequest, options?: RequestInit) => Promise<createLectureResponse>;
/**
 * @summary Search lessons by title or content
 */
type searchLecturesResponse = {
    data: LectureSearchHit[];
    status: number;
};
declare const getSearchLecturesUrl: (params?: SearchLecturesParams) => string;
declare const searchLectures: (params?: SearchLecturesParams, options?: RequestInit) => Promise<searchLecturesResponse>;
/**
 * @summary Trigger re-index background job
 */
type reindexSearchResponse = {
    data: ReindexResponse;
    status: number;
};
declare const getReindexSearchUrl: () => string;
declare const reindexSearch: (options?: RequestInit) => Promise<reindexSearchResponse>;
/**
 * @summary List queued outbox jobs
 */
type listJobsResponse = {
    data: OutboxJob[];
    status: number;
};
declare const getListJobsUrl: () => string;
declare const listJobs: (options?: RequestInit) => Promise<listJobsResponse>;
/**
 * @summary Enqueue a job into the outbox
 */
type enqueueJobResponse = {
    data: OutboxJob;
    status: number;
};
declare const getEnqueueJobUrl: () => string;
declare const enqueueJob: (enqueueJobRequest: EnqueueJobRequest, options?: RequestInit) => Promise<enqueueJobResponse>;
/**
 * @summary List at-risk students (risk triage queue)
 */
type getRiskQueueResponse = {
    data: RiskStudent[];
    status: number;
};
declare const getGetRiskQueueUrl: (params?: GetRiskQueueParams) => string;
declare const getRiskQueue: (params?: GetRiskQueueParams, options?: RequestInit) => Promise<getRiskQueueResponse>;
/**
 * @summary Get student detail profile
 */
type getStudentResponse = {
    data: StudentDetail;
    status: number;
};
declare const getGetStudentUrl: (id: string) => string;
declare const getStudent: (id: string, options?: RequestInit) => Promise<getStudentResponse>;
/**
 * @summary Create a support ticket for a student
 */
type createTicketResponse = {
    data: CreatedResource;
    status: number;
};
declare const getCreateTicketUrl: (id: string) => string;
declare const createTicket: (id: string, createTicketRequest: CreateTicketRequest, options?: RequestInit) => Promise<createTicketResponse>;
/**
 * @summary Schedule an office hour session for a student
 */
type scheduleOfficeHourResponse = {
    data: CreatedResource;
    status: number;
};
declare const getScheduleOfficeHourUrl: (id: string) => string;
declare const scheduleOfficeHour: (id: string, scheduleOfficeHourRequest: ScheduleOfficeHourRequest, options?: RequestInit) => Promise<scheduleOfficeHourResponse>;

interface AuthorizedFetcherOptions extends RequestInit {
    /** Optional bearer token that will be inserted into the Authorization header */
    token?: string;
    /** Override base URL if different from environment default */
    baseUrl?: string;
}
declare function authorizedFetcher<TResponse>(url: string, init?: AuthorizedFetcherOptions): Promise<TResponse>;

export { type AuthLoginRequest, type AuthTokenResponse, type AuthorizedFetcherOptions, type Course, type CourseSearchHit, CourseSearchHitVisibility, CourseVisibility, type CreateCourseRequest, type CreateCourseRequestAllOf, type CreateLectureRequest, type CreateTicketRequest, type CreatedResource, type EnqueueJobRequest, type EnqueueJobRequestPayload, type EnrollmentResponse, type GetRiskQueueParams, type Lecture, type LectureSearchHit, type OutboxJob, type OutboxJobPayload, type ReindexResponse, type RiskStudent, type ScheduleOfficeHourRequest, type SearchCoursesParams, type SearchLecturesParams, type StudentDetail, type StudentDetailAllOf, type StudentDetailAllOfEnrollmentsItem, type StudentDetailAllOfNotesItem, type StudentDetailAllOfOfficeHoursItem, StudentDetailAllOfOfficeHoursItemStatus, type StudentDetailAllOfTicketsItem, StudentDetailAllOfTicketsItemStatus, type UpdateCourseRequest, UpdateCourseRequestVisibility, authorizedFetcher, createCourse, type createCourseResponse, createLecture, type createLectureResponse, createTicket, type createTicketResponse, enqueueJob, type enqueueJobResponse, enrollInCourse, type enrollInCourseResponse, getCreateCourseUrl, getCreateLectureUrl, getCreateTicketUrl, getEnqueueJobUrl, getEnrollInCourseUrl, getGetRiskQueueUrl, getGetStudentUrl, getListCoursesUrl, getListJobsUrl, getListLecturesUrl, getLoginUrl, getReindexSearchUrl, getRiskQueue, type getRiskQueueResponse, getScheduleOfficeHourUrl, getSearchCoursesUrl, getSearchLecturesUrl, getStudent, type getStudentResponse, getUpdateCourseUrl, listCourses, type listCoursesResponse, listJobs, type listJobsResponse, listLectures, type listLecturesResponse, login, type loginResponse, reindexSearch, type reindexSearchResponse, scheduleOfficeHour, type scheduleOfficeHourResponse, searchCourses, type searchCoursesResponse, searchLectures, type searchLecturesResponse, updateCourse, type updateCourseResponse };
