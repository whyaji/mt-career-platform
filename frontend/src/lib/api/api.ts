import { BASE_URL_API } from "@/constants/env";

export const baseApiUrl = `${BASE_URL_API}/api/v1`;

export type DefaultResponseType<T = undefined> =
    | {
          success: boolean;
          message: string;
          data?: T;
      }
    | {
          success: boolean;
          error: string;
          message: string;
      };
