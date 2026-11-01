// feedback group: web components.
export { ALERT_ICONS, alertClass, alertRole, createAlert, type AlertHandle, type AlertOptions, type AlertTone } from './alert.ts';
export {
  RING,
  createProgressBar,
  createProgressRing,
  progressAria,
  progressBarClass,
  progressPercent,
  progressRingClass,
  progressValueText,
  ringDash,
  type ProgressAria,
  type ProgressBarHandle,
  type ProgressBarOptions,
  type ProgressRingHandle,
  type ProgressRingOptions,
  type ProgressSize,
  type ProgressTone,
} from './progress.ts';
export { createSpinner, spinnerClass, type SpinnerOptions, type SpinnerSize } from './spinner.ts';
export { createSkeleton, skeletonClass, skeletonLineWidths, skeletonShapeStyle, type SkeletonOptions, type SkeletonShape } from './skeleton.ts';
export { badgeClass, badgeCountText, badgeText, badgeTone, createBadge, type BadgeHandle, type BadgeOptions, type BadgeTone } from './badge.ts';
export { STATUS_LABELS, createStatus, statusClass, type StatusHandle, type StatusOptions, type StatusState } from './status.ts';
export { createEmptyState, emptyStateClass, type EmptyStateOptions } from './emptyState.ts';
export { createProgressList, progressListMeta, type ProgressListHandle, type ProgressListItem, type ProgressListOptions } from './progressList.ts';
export {
  VOICE_BAR_SAMPLES,
  VOICE_PHASE_LABELS,
  createVoiceBar,
  emptyVoiceLevels,
  pushVoiceLevel,
  voiceBarClass,
  voiceLevel,
  type VoiceBarHandle,
  type VoiceBarOptions,
  type VoiceBarVariant,
  type VoicePhase,
} from './voiceBar.ts';
export { NOTICE_ICONS, createNotice, noticeActionStyle, noticeClass, noticeDismissible, type NoticeAction, type NoticeHandle, type NoticeKind, type NoticeOptions } from './notice.ts';
export {
  RECORDING_PILL_SAMPLES,
  createRecordingPill,
  elapsedDuration,
  emptyRecordingLevels,
  formatElapsed,
  pushRecordingLevel,
  recordingPillClass,
  type RecordingPillHandle,
  type RecordingPillOptions,
  type RecordingPillPlacement,
} from './recordingPill.ts';
