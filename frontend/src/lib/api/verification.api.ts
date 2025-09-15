import { baseApiUrl } from "./api";

export const getVerificationPath = async (location: string, batch: string) => {
    const response = await fetch(
        `${baseApiUrl}/verification/path/${location}/${batch}`,
    );
    return response;
};
