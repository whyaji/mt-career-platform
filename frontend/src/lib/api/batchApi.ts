import { baseApiUrl } from "./api";

export const getActiveBatches = async () => {
    const response = await fetch(`${baseApiUrl}/batch/active`);
    return response.json();
};
