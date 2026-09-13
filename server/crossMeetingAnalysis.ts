import { db } from './db';
import {
  analyzeCommitmentRelationship,
  detectRepeatedIssues,
} from './groq';
import {
  Commitment,
  UnresolvedIssue,
  ItemStatus,
  CrossMeetingAnalysisResult,
  ExtractionResult,
} from './types';

/**
 * Execute the Cross-Meeting Accountability Engine
 */
export async function runCrossMeetingAccountabilityEngine(
  userId: string,
  newMeetingId: string,
  newMeetingTitle: string,
  newMeetingDate: string,
  newMeetingTranscript: string,
  extracted: ExtractionResult
): Promise<CrossMeetingAnalysisResult> {
  // Step 1: Fetch all previous commitments for this user (excluding items from the new meeting)
  const allUserCommitments = db.getCommitments(userId);
  const previousCommitments = allUserCommitments.filter((c) => c.meetingId !== newMeetingId);

  // We are particularly interested in checking active commitments (PENDING, OVERDUE, REPEATED_UNRESOLVED)
  const activePrevious = previousCommitments.filter(
    (c) => c.status === 'PENDING' || c.status === 'OVERDUE' || c.status === 'REPEATED_UNRESOLVED'
  );

  const updatedCommitments: CrossMeetingAnalysisResult['updatedCommitments'] = [];

  // Step 2 & 3: Compare each previous open commitment with new meeting context
  for (const prev of activePrevious) {
    try {
      const match = await analyzeCommitmentRelationship(
        {
          id: prev.id,
          person: prev.person,
          description: prev.description,
          deadline: prev.deadline,
          status: prev.status,
        },
        newMeetingTranscript,
        {
          commitments: extracted.commitments,
          actionItems: extracted.actionItems,
          summary: extracted.summary,
        }
      );

      if (match && match.relationship !== 'NOT_RELATED' && match.confidence >= 0.6) {
        let newStatus: ItemStatus = prev.status;

        if (match.relationship === 'COMPLETED') {
          newStatus = 'COMPLETED';
        } else if (match.relationship === 'OVERDUE') {
          newStatus = 'OVERDUE';
        } else if (match.relationship === 'REPEATED_UNRESOLVED') {
          newStatus = 'REPEATED_UNRESOLVED';
        } else if (match.relationship === 'STILL_PENDING') {
          // Check if deadline has passed
          if (prev.deadline && new Date(prev.deadline).getTime() < new Date(newMeetingDate).getTime()) {
            newStatus = 'OVERDUE';
          } else {
            newStatus = 'PENDING';
          }
        }

        if (newStatus !== prev.status || match.confidence >= 0.7) {
          const updated = db.updateCommitmentStatus(
            prev.id,
            newStatus,
            newMeetingId,
            newMeetingTitle,
            newMeetingDate,
            match.reason || `Referenced in ${newMeetingTitle}`,
            match.confidence
          );

          if (updated) {
            updatedCommitments.push({
              commitmentId: prev.id,
              previousStatus: prev.status,
              newStatus,
              reason: match.reason,
              confidence: match.confidence,
            });
          }
        }
      } else {
        // Even if not explicitly mentioned, check if deadline has passed in current time
        if (
          prev.status === 'PENDING' &&
          prev.deadline &&
          new Date(prev.deadline).getTime() < new Date(newMeetingDate).getTime()
        ) {
          const updated = db.updateCommitmentStatus(
            prev.id,
            'OVERDUE',
            newMeetingId,
            newMeetingTitle,
            newMeetingDate,
            `Target deadline of ${prev.deadline.split('T')[0]} has passed with no recorded completion.`,
            0.9
          );
          if (updated) {
            updatedCommitments.push({
              commitmentId: prev.id,
              previousStatus: 'PENDING',
              newStatus: 'OVERDUE',
              reason: `Target deadline ${prev.deadline.split('T')[0]} passed without reported completion.`,
              confidence: 0.9,
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[CrossMeeting] Error matching commitment ${prev.id}:`, err);
    }
  }

  // Step 4: Repeated Issue Detection
  // Fetch existing unresolved issues for this user
  const allUserIssues = db.getUnresolvedIssues(userId);
  const previousIssues = allUserIssues.filter((i) => i.meetingId !== newMeetingId);

  const repeatedIssuesDetected: CrossMeetingAnalysisResult['repeatedIssuesDetected'] = [];

  if (previousIssues.length > 0 && extracted.unresolvedIssues.length > 0) {
    try {
      const issueMatches = await detectRepeatedIssues(
        previousIssues.map((i) => ({ id: i.id, description: i.description, timesRepeated: i.timesRepeated })),
        extracted.unresolvedIssues
      );

      const matchedNewIndices = new Set<number>();

      for (const match of issueMatches) {
        const existing = previousIssues.find((p) => p.id === match.existingIssueId);
        if (existing) {
          const newCount = existing.timesRepeated + 1;
          const updated = db.updateUnresolvedIssue(
            existing.id,
            newCount,
            'REPEATED_UNRESOLVED',
            newMeetingId
          );
          if (updated) {
            repeatedIssuesDetected.push({
              issueId: existing.id,
              description: existing.description,
              timesRepeated: newCount,
            });
          }
        }
      }
    } catch (issueErr) {
      console.warn('[CrossMeeting] Error detecting repeated issues:', issueErr);
    }
  }

  // Generate an intelligent cross-meeting synthesis insight
  let summaryInsight = 'Cross-meeting analysis completed.';
  if (updatedCommitments.length > 0 || repeatedIssuesDetected.length > 0) {
    const completedCount = updatedCommitments.filter((u) => u.newStatus === 'COMPLETED').length;
    const overdueCount = updatedCommitments.filter((u) => u.newStatus === 'OVERDUE').length;
    summaryInsight = `Accountability Memory updated: ${completedCount} commitment(s) marked completed, ${overdueCount} flagged overdue, and ${repeatedIssuesDetected.length} recurring issue(s) tracked across meetings.`;
  } else {
    summaryInsight = 'New meeting ingested. No prior open commitments were directly altered.';
  }

  return {
    updatedCommitments,
    newCommitmentsCreated: extracted.commitments.length,
    repeatedIssuesDetected,
    summaryInsight,
  };
}
