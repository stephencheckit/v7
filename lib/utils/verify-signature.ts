/**
 * Signature Verification Utilities
 * For 21 CFR Part 11 Compliance
 */

export interface SignatureData {
  id: string;
  fieldId: string;
  signedBy: string;
  signedById: string | null;
  signedAt: string;
  signatureMeaning: string;
  signatureData: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  certificateAcceptedAt: string | null;
  metadata: {
    strokeCount: number;
    signatureTime: number;
    canvasWidth: number;
    canvasHeight: number;
  };
}

export interface SignatureAuditEntry {
  timestamp: string;
  action: string;
  signatureId: string;
  userId: string | null;
  ipAddress: string;
}

export interface SignatureVerificationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
  complianceScore: number; // 0-100
}

/**
 * Verify that a signature meets CFR Part 11 requirements
 */
export function verifySignatureIntegrity(signature: SignatureData): SignatureVerificationResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  let complianceScore = 100;

  // Critical Requirements (each -20 points)
  if (!signature.signedBy || signature.signedBy.trim().length === 0) {
    issues.push('Missing signer name');
    complianceScore -= 20;
  }

  if (!signature.signedAt) {
    issues.push('Missing signature timestamp');
    complianceScore -= 20;
  }

  if (!signature.signatureData || signature.signatureData.length === 0) {
    issues.push('Missing signature image data');
    complianceScore -= 20;
  }

  if (!signature.ipAddress || signature.ipAddress === 'unknown') {
    issues.push('Missing IP address');
    complianceScore -= 20;
  }

  if (!signature.certificateAcceptedAt) {
    issues.push('Certificate not accepted');
    complianceScore -= 20;
  }

  // Important Requirements (each -10 points)
  if (!signature.signatureMeaning) {
    warnings.push('Missing signature meaning');
    complianceScore -= 10;
  }

  if (!signature.userAgent || signature.userAgent === 'unknown') {
    warnings.push('Missing user agent information');
    complianceScore -= 10;
  }

  if (!signature.metadata || !signature.metadata.strokeCount) {
    warnings.push('Missing stroke metadata');
    complianceScore -= 5;
  }

  if (signature.metadata && signature.metadata.strokeCount < 3) {
    warnings.push('Very few strokes detected (possible quality issue)');
    complianceScore -= 5;
  }

  // Timestamp validation
  try {
    const signedDate = new Date(signature.signedAt);
    const now = new Date();
    const futureDate = new Date(now.getTime() + 60000); // 1 minute in future (clock drift tolerance)
    
    if (signedDate > futureDate) {
      issues.push('Signature timestamp is in the future');
      complianceScore -= 15;
    }

    const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
    if (signedDate < oneYearAgo) {
      warnings.push('Signature is more than 1 year old');
    }
  } catch (e) {
    issues.push('Invalid timestamp format');
    complianceScore -= 15;
  }

  // Ensure score doesn't go below 0
  complianceScore = Math.max(0, complianceScore);

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    complianceScore
  };
}

/**
 * Verify an entire submission's signatures
 */
export function verifySubmissionSignatures(
  signatures: SignatureData[],
  auditTrail: SignatureAuditEntry[]
): SignatureVerificationResult {
  const allIssues: string[] = [];
  const allWarnings: string[] = [];
  let totalScore = 0;

  if (!signatures || signatures.length === 0) {
    return {
      valid: true, // No signatures to validate
      issues: [],
      warnings: ['No signatures present'],
      complianceScore: 100
    };
  }

  // Verify each signature
  signatures.forEach((sig, index) => {
    const result = verifySignatureIntegrity(sig);
    allIssues.push(...result.issues.map(issue => `Signature ${index + 1}: ${issue}`));
    allWarnings.push(...result.warnings.map(warning => `Signature ${index + 1}: ${warning}`));
    totalScore += result.complianceScore;
  });

  // Verify audit trail completeness
  if (!auditTrail || auditTrail.length === 0) {
    allIssues.push('Missing audit trail');
    totalScore -= 20;
  } else {
    // Check that each signature has a corresponding audit entry
    signatures.forEach((sig, index) => {
      const hasAudit = auditTrail.some(entry => entry.signatureId === sig.id);
      if (!hasAudit) {
        allIssues.push(`Signature ${index + 1}: Missing audit trail entry`);
        totalScore -= 10;
      }
    });
  }

  const averageScore = signatures.length > 0 ? totalScore / signatures.length : 0;

  return {
    valid: allIssues.length === 0,
    issues: allIssues,
    warnings: allWarnings,
    complianceScore: Math.max(0, Math.round(averageScore))
  };
}

/**
 * Get a human-readable compliance status
 */
export function getComplianceStatus(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 95) {
    return {
      label: 'Fully Compliant',
      color: 'green',
      description: 'Meets all CFR Part 11 requirements'
    };
  } else if (score >= 80) {
    return {
      label: 'Compliant with Warnings',
      color: 'yellow',
      description: 'Meets critical requirements but has minor issues'
    };
  } else if (score >= 60) {
    return {
      label: 'Partially Compliant',
      color: 'orange',
      description: 'Missing some important compliance requirements'
    };
  } else {
    return {
      label: 'Non-Compliant',
      color: 'red',
      description: 'Does not meet CFR Part 11 requirements'
    };
  }
}

/**
 * Format signature for display
 */
export function formatSignatureDetails(signature: SignatureData): string[] {
  const details: string[] = [];
  
  details.push(`Signed by: ${signature.signedBy}`);
  details.push(`Date: ${new Date(signature.signedAt).toLocaleString()}`);
  details.push(`Meaning: ${signature.signatureMeaning}`);
  details.push(`IP Address: ${signature.ipAddress}`);
  details.push(`Device: ${signature.deviceType}`);
  
  if (signature.metadata) {
    details.push(`Strokes: ${signature.metadata.strokeCount}`);
    details.push(`Time taken: ${(signature.metadata.signatureTime / 1000).toFixed(1)}s`);
  }
  
  if (signature.certificateAcceptedAt) {
    details.push(`Certificate accepted: ${new Date(signature.certificateAcceptedAt).toLocaleString()}`);
  }
  
  return details;
}

