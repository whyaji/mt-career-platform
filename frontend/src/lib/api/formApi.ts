import type { ApplicantDataPostType } from "@/types/applicantData.type";

import { baseApiUrl, type DefaultResponseType } from "./api";

export const submitForm = async (
    data: ApplicantDataPostType,
): Promise<DefaultResponseType> => {
    const response = await fetch(`${baseApiUrl}/form`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return await response.json();
};
