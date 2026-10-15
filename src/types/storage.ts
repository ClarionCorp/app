// For interfacing with local and session storages

export type ReloadReasons = 'ACCOUNT_CHANGE'

export type ReloadReason = {
  reason: ReloadReasons,
  acknowledged: boolean,
}

