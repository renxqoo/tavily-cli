/**
 * Tavily API 类型定义
 *
 * 来源: https://docs.tavily.com/documentation/api-reference
 */

// ─── Search API ──────────────────────────────────────────────

export type SearchDepth = "advanced" | "basic" | "fast" | "ultra-fast";
export type SearchTopic = "general" | "news" | "finance";
export type TimeRange = "day" | "week" | "month" | "year" | "d" | "w" | "m" | "y";

export interface SearchRequest {
  query: string;
  search_depth?: SearchDepth;
  chunks_per_source?: number;
  max_results?: number;
  topic?: SearchTopic;
  time_range?: TimeRange;
  start_date?: string;
  end_date?: string;
  include_answer?: boolean | "basic" | "advanced";
  include_raw_content?: boolean | "markdown" | "text";
  include_images?: boolean;
  include_image_descriptions?: boolean;
  include_favicon?: boolean;
  include_domains?: string[];
  exclude_domains?: string[];
  country?: string;
  auto_parameters?: boolean;
  exact_match?: boolean;
  include_usage?: boolean;
  safe_search?: boolean;
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  raw_content?: string | null;
  score?: number;
  favicon?: string;
  images?: SearchResultImage[];
}

export interface SearchResultImage {
  url: string;
  description?: string;
}

export interface SearchUsage {
  credits?: number;
}

export interface SearchResponse {
  query: string;
  answer?: string;
  images?: SearchResultImage[];
  results: SearchResult[];
  response_time: number;
  auto_parameters?: {
    topic?: string;
    search_depth?: string;
  };
  usage?: SearchUsage;
  request_id?: string;
}

// ─── Extract API ─────────────────────────────────────────────

export type ExtractDepth = "basic" | "advanced";
export type ExtractFormat = "markdown" | "text";

export interface ExtractRequest {
  urls: string | string[];
  query?: string;
  chunks_per_source?: number;
  extract_depth?: ExtractDepth;
  include_images?: boolean;
  include_favicon?: boolean;
  format?: ExtractFormat;
  timeout?: number;
  include_usage?: boolean;
}

export interface ExtractResult {
  title?: string;
  url: string;
  raw_content?: string;
  images?: string[];
  favicon?: string;
  included?: boolean;
}

export interface ExtractFailedResult {
  url: string;
  error?: string;
}

export interface ExtractUsage {
  credits?: number;
}

export interface ExtractResponse {
  results: ExtractResult[];
  failed_results: ExtractFailedResult[];
  response_time: number;
  usage?: ExtractUsage;
  request_id?: string;
}

// ─── Crawl API ───────────────────────────────────────────────

export type CrawlExtractDepth = "basic" | "advanced";
export type CrawlFormat = "markdown" | "text";

export interface CrawlRequest {
  url: string;
  instructions?: string;
  chunks_per_source?: number;
  max_depth?: number; // 1-5
  max_breadth?: number; // 1-500
  limit?: number; // >= 1
  select_paths?: string[];
  select_domains?: string[];
  exclude_paths?: string[];
  exclude_domains?: string[];
  allow_external?: boolean;
  include_images?: boolean;
  extract_depth?: CrawlExtractDepth;
  format?: CrawlFormat;
  include_favicon?: boolean;
  timeout?: number; // 10-150
  include_usage?: boolean;
}

export interface CrawlResult {
  url: string;
  raw_content: string;
  favicon?: string;
  images?: string[];
}

export interface CrawlResponse {
  base_url: string;
  results: CrawlResult[];
  response_time: number;
  usage?: SearchUsage;
  request_id?: string;
}

// ─── Map API ─────────────────────────────────────────────────

export interface MapRequest {
  url: string;
  instructions?: string;
  max_depth?: number; // 1-5
  max_breadth?: number; // 1-500
  limit?: number; // >= 1
  select_paths?: string[];
  select_domains?: string[];
  exclude_paths?: string[];
  exclude_domains?: string[];
  allow_external?: boolean;
  timeout?: number; // 10-150
  include_usage?: boolean;
}

export interface MapResponse {
  base_url: string;
  results: string[];
  response_time: number;
  usage?: SearchUsage;
  request_id?: string;
}

// ─── Research API ────────────────────────────────────────────

export type ResearchModel = "mini" | "pro" | "auto";
export type CitationFormat = "numbered" | "mla" | "apa" | "chicago";
export type OutputLength = "short" | "standard" | "long";
export type ResearchStatus = "pending" | "in_progress" | "completed" | "failed";

export interface ResearchRequest {
  input: string;
  model?: ResearchModel;
  stream?: boolean;
  output_schema?: Record<string, unknown>;
  citation_format?: CitationFormat;
  include_domains?: string[];
  exclude_domains?: string[];
  output_length?: OutputLength;
  files?: { name: string; data: string; type: "base64" }[];
}

export interface ResearchTask {
  request_id: string;
  created_at: string;
  status: ResearchStatus;
  input: string;
  model: string;
  response_time?: number;
}

export interface ResearchSource {
  title: string;
  url: string;
  favicon?: string;
}

export interface ResearchResult extends ResearchTask {
  completed_at?: string;
  content?: string | Record<string, unknown>;
  sources?: ResearchSource[];
  error?: string;
}
