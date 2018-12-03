import {
  GitHubIcon,
  GitHubIssue,
  GitHubNotification,
  GitHubPullRequest,
} from '@devhub/core/src/types'
import {
  getCommitIconAndColor,
  isPullRequest,
} from '@devhub/core/src/utils/helpers/github/shared'
import * as colors from '../../../styles/colors'

export function getPullRequestIconAndColor(pullRequest: {
  state?: GitHubPullRequest['state']
  merged_at?: GitHubPullRequest['merged_at']
}): { icon: GitHubIcon; color?: string } {
  const merged = pullRequest.merged_at
  const state = merged ? 'merged' : pullRequest.state

  switch (state) {
    case 'open':
      return { icon: 'git-pull-request', color: colors.green }

    case 'closed':
      return { icon: 'git-pull-request', color: colors.red }

    case 'merged':
      return { icon: 'git-merge', color: colors.purple }

    default:
      return { icon: 'git-pull-request' }
  }
}

export function getIssueIconAndColor(issue: {
  state?: GitHubPullRequest['state']
  merged_at?: GitHubPullRequest['merged_at']
}): { icon: GitHubIcon; color?: string } {
  const { state } = issue

  if (isPullRequest(issue)) {
    return getPullRequestIconAndColor(issue as GitHubPullRequest)
  }

  switch (state) {
    case 'open':
      return { icon: 'issue-opened', color: colors.green }

    case 'closed':
      return { icon: 'issue-closed', color: colors.red }

    default:
      return { icon: 'issue-opened' }
  }
}

export function getNotificationIconAndColor(
  notification: GitHubNotification,
  payload?: GitHubIssue | GitHubPullRequest | undefined,
): { icon: GitHubIcon; color?: string } {
  const { subject } = notification
  const { type } = subject

  switch (type) {
    case 'Commit':
      return getCommitIconAndColor()
    case 'Issue':
      return getIssueIconAndColor(payload as GitHubIssue)
    case 'PullRequest':
      return getPullRequestIconAndColor(payload as GitHubPullRequest)
    case 'Release':
      return { icon: 'tag' }
    case 'RepositoryInvitation':
      return { icon: 'mail' }
    case 'RepositoryVulnerabilityAlert':
      return { icon: 'alert', color: colors.yellow }
    default: {
      console.error('Unknown notification type', type)
      return { icon: 'bell' }
    }
  }
}
