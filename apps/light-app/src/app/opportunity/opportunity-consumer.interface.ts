export enum accessLevelsName {
  CI = 'CONFIDENTIAL_INFORMATION',
  VDR = 'VDR'
}

export enum tagForAccess {
  Live = 'LIVE',
  Requested = 'REQUESTED'
}

export enum accessStatus {
  Pending = 'pending',
  Rejected = 'rejected',
  Approved = 'approved',
  Revoked = 'revoked'
}
