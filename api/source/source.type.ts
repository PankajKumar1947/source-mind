export interface ISource {
  sourceId: string;
  title: string | null;
  sourceType: "PDF" | "TEXT" | "WEB_LINK" | "YT_VIDEO" | "VTT";
  status: "PENDING" | "SUCCESS" | "FAILED" | "PROCESSING";
  createdAt: Date;
}
