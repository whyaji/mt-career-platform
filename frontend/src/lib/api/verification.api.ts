import { baseApiUrl } from './api';

const verificationUrl = `${baseApiUrl}/verification`;

export const getVerificationPath = async (location: string, batch: string) => {
  const response = await fetch(`${verificationUrl}/path/${location}/${batch}`);
  return response;
};

export const getVerificationFormPath = async (
  programCode: string,
  batchLocationCode: string,
  batchNumberCode: string
) => {
  const response = await fetch(
    `${verificationUrl}/form-path/${programCode}/${batchLocationCode}/${batchNumberCode}`
  );
  return response;
};
