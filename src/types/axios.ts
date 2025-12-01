// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AxiosExtendedResponse<T = any> {
  status: "error" | "success";
  message: string;
  error?: string;
  data?: T;
}

export type { AxiosExtendedResponse };
