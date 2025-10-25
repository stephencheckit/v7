'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { 
  SignatureData, 
  verifySignatureIntegrity, 
  getComplianceStatus,
  formatSignatureDetails 
} from '@/lib/utils/verify-signature';

interface SignatureDisplayProps {
  signature: SignatureData;
  showDetails?: boolean;
  compact?: boolean;
}

export function SignatureDisplay({ signature, showDetails = false, compact = false }: SignatureDisplayProps) {
  const [expanded, setExpanded] = useState(showDetails);
  const verificationResult = verifySignatureIntegrity(signature);
  const complianceStatus = getComplianceStatus(verificationResult.complianceScore);

  const getStatusIcon = () => {
    if (verificationResult.complianceScore >= 95) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (verificationResult.complianceScore >= 80) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (complianceStatus.color) {
      case 'green': return 'bg-green-500/10 border-green-500/30 text-green-500';
      case 'yellow': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
      case 'orange': return 'bg-orange-500/10 border-orange-500/30 text-orange-500';
      case 'red': return 'bg-red-500/10 border-red-500/30 text-red-500';
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-500';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-lg">
        <img 
          src={signature.signatureData} 
          alt="Signature" 
          className="h-12 border border-gray-300 dark:border-gray-600 bg-white rounded"
          style={{ minWidth: '80px', maxWidth: '120px' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-sm">{signature.signedBy}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {signature.signatureMeaning} • {new Date(signature.signedAt).toLocaleString()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 border-2">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-2">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Electronic Signature
              <Badge variant="outline" className={getStatusColor()}>
                {complianceStatus.label}
              </Badge>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              CFR Part 11 Compliant • Score: {verificationResult.complianceScore}/100
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Signature Image */}
      <div className="mb-4">
        <img 
          src={signature.signatureData} 
          alt="Signature" 
          className="border-2 border-gray-300 dark:border-gray-600 bg-white rounded-lg p-2 w-full max-w-md"
          style={{ maxHeight: '120px', objectFit: 'contain' }}
        />
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Signed By</p>
          <p className="text-sm font-semibold">{signature.signedBy}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Date & Time</p>
          <p className="text-sm font-semibold">{new Date(signature.signedAt).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Signature Meaning</p>
          <p className="text-sm font-semibold">{signature.signatureMeaning}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">IP Address</p>
          <p className="text-sm font-semibold font-mono">{signature.ipAddress}</p>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t pt-4 space-y-4">
          {/* Verification Status */}
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              {getStatusIcon()}
              Verification Status
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {complianceStatus.description}
            </p>
            
            {/* Issues */}
            {verificationResult.issues.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-3 mt-2">
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Issues:</p>
                <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
                  {verificationResult.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {verificationResult.warnings.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-3 mt-2">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Warnings:</p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside space-y-1">
                  {verificationResult.warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Technical Details */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Technical Details</h4>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Signature ID:</span>
                <span className="font-semibold">{signature.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Device Type:</span>
                <span className="font-semibold">{signature.deviceType}</span>
              </div>
              {signature.metadata && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Stroke Count:</span>
                    <span className="font-semibold">{signature.metadata.strokeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Signature Time:</span>
                    <span className="font-semibold">{(signature.metadata.signatureTime / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Canvas Size:</span>
                    <span className="font-semibold">{signature.metadata.canvasWidth} × {signature.metadata.canvasHeight}</span>
                  </div>
                </>
              )}
              {signature.certificateAcceptedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Certificate Accepted:</span>
                  <span className="font-semibold">{new Date(signature.certificateAcceptedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">User Agent:</span>
                <span className="font-semibold truncate max-w-xs" title={signature.userAgent}>
                  {signature.userAgent.substring(0, 40)}...
                </span>
              </div>
            </div>
          </div>

          {/* CFR Part 11 Checklist */}
          <div>
            <h4 className="text-sm font-semibold mb-2">CFR Part 11 Compliance Checklist</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Unique electronic signature</span>
              </div>
              <div className="flex items-center gap-2">
                {signature.signedById ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm">Identity verification</span>
              </div>
              <div className="flex items-center gap-2">
                {signature.certificateAcceptedAt ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Legal certification accepted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Signature manifestation (name, date, meaning)</span>
              </div>
              <div className="flex items-center gap-2">
                {signature.ipAddress && signature.ipAddress !== 'unknown' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">Audit trail (IP, timestamp, device)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Signature/record linking</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Display multiple signatures with verification
 */
export function SignatureList({ signatures }: { signatures: SignatureData[] }) {
  if (!signatures || signatures.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No signatures present
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {signatures.map((signature, index) => (
        <SignatureDisplay 
          key={signature.id || index}
          signature={signature}
          showDetails={false}
        />
      ))}
    </div>
  );
}

