export enum APPLICANT_DATA_SCREENING_STATUS {
  PENDING = 1,
  STOP = 2,
  NOT_YET = 3,
  PROCESS = 4,
  DONE = 5,
}

export enum APPLICANT_DATA_REVIEW_STATUS {
  PENDING = 1,
  STOP = 2,
  UNREVIEWED = 3,
  REJECTED = 4,
  ACCEPTED = 5,
}

export enum APPLICANT_DATA_GRADUATION_STATUS {
  PENDING = 1,
  ERROR = 2,
  NOT_FOUND = 3,
  DROPOUT = 4,
  NOT_GRADUATED = 5,
  NOT_MATCH = 6,
  GRADUATED = 7,
}

export const APPLICANT_DATA_SCREENING_STATUS_LABELS = {
  [APPLICANT_DATA_SCREENING_STATUS.PENDING]: 'Pending',
  [APPLICANT_DATA_SCREENING_STATUS.STOP]: 'Stop',
  [APPLICANT_DATA_SCREENING_STATUS.NOT_YET]: 'Not Yet',
  [APPLICANT_DATA_SCREENING_STATUS.PROCESS]: 'Process',
  [APPLICANT_DATA_SCREENING_STATUS.DONE]: 'Done',
};

export const APPLICANT_DATA_REVIEW_STATUS_LABELS = {
  [APPLICANT_DATA_REVIEW_STATUS.PENDING]: 'Pending',
  [APPLICANT_DATA_REVIEW_STATUS.STOP]: 'Stop',
  [APPLICANT_DATA_REVIEW_STATUS.UNREVIEWED]: 'Unreviewed',
  [APPLICANT_DATA_REVIEW_STATUS.REJECTED]: 'Rejected',
  [APPLICANT_DATA_REVIEW_STATUS.ACCEPTED]: 'Accepted',
};

export const APPLICANT_DATA_GRADUATION_STATUS_LABELS = {
  [APPLICANT_DATA_GRADUATION_STATUS.PENDING]: 'Pending',
  [APPLICANT_DATA_GRADUATION_STATUS.ERROR]: 'Error',
  [APPLICANT_DATA_GRADUATION_STATUS.NOT_FOUND]: 'Not Found',
  [APPLICANT_DATA_GRADUATION_STATUS.DROPOUT]: 'Dropout',
  [APPLICANT_DATA_GRADUATION_STATUS.NOT_GRADUATED]: 'Not Graduated',
  [APPLICANT_DATA_GRADUATION_STATUS.NOT_MATCH]: 'Not Match',
  [APPLICANT_DATA_GRADUATION_STATUS.GRADUATED]: 'Graduated',
};

export const getApplicantDataStatusColor = (
  status: number,
  type: 'screening' | 'review' | 'graduation'
) => {
  if (type === 'screening') {
    switch (status) {
      case APPLICANT_DATA_SCREENING_STATUS.PENDING:
        return 'yellow';
      case APPLICANT_DATA_SCREENING_STATUS.STOP:
        return 'red';
      case APPLICANT_DATA_SCREENING_STATUS.NOT_YET:
        return 'gray';
      case APPLICANT_DATA_SCREENING_STATUS.PROCESS:
        return 'blue';
      case APPLICANT_DATA_SCREENING_STATUS.DONE:
        return 'green';
      default:
        return 'gray';
    }
  } else if (type === 'review') {
    switch (status) {
      case APPLICANT_DATA_REVIEW_STATUS.PENDING:
        return 'blue';
      case APPLICANT_DATA_REVIEW_STATUS.STOP:
        return 'gray';
      case APPLICANT_DATA_REVIEW_STATUS.UNREVIEWED:
        return 'yellow';
      case APPLICANT_DATA_REVIEW_STATUS.REJECTED:
        return 'red';
      case APPLICANT_DATA_REVIEW_STATUS.ACCEPTED:
        return 'green';
      default:
        return 'gray';
    }
  } else {
    // graduation
    switch (status) {
      case APPLICANT_DATA_GRADUATION_STATUS.PENDING:
        return 'yellow';
      case APPLICANT_DATA_GRADUATION_STATUS.ERROR:
        return 'red';
      case APPLICANT_DATA_GRADUATION_STATUS.NOT_FOUND:
        return 'orange';
      case APPLICANT_DATA_GRADUATION_STATUS.DROPOUT:
        return 'red';
      case APPLICANT_DATA_GRADUATION_STATUS.NOT_GRADUATED:
        return 'blue';
      case APPLICANT_DATA_GRADUATION_STATUS.NOT_MATCH:
        return 'cyan';
      case APPLICANT_DATA_GRADUATION_STATUS.GRADUATED:
        return 'green';
      default:
        return 'gray';
    }
  }
};

export const APPLICANT_DATA_REVIEW_STATUS_LIST = [
  {
    value: APPLICANT_DATA_REVIEW_STATUS.PENDING,
    label: 'Pending',
    color: 'blue',
  },
  {
    value: APPLICANT_DATA_REVIEW_STATUS.STOP,
    label: 'Stop',
    color: 'gray',
  },
  {
    value: APPLICANT_DATA_REVIEW_STATUS.UNREVIEWED,
    label: 'Unreviewed',
    color: 'yellow',
  },
  {
    value: APPLICANT_DATA_REVIEW_STATUS.REJECTED,
    label: 'Reject',
    color: 'red',
  },
  {
    value: APPLICANT_DATA_REVIEW_STATUS.ACCEPTED,
    label: 'Accepted',
    color: 'green',
  },
];
