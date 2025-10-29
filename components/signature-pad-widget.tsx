'use client';

import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PenTool, Trash2, Check, AlertCircle, Loader2, Shield } from 'lucide-react';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SignaturePadWidgetProps {
  field: {
    id: string;
    name: string;
    label: string;
    required: boolean;
    signatureMeaning?: string;
    requireCertification?: boolean;
    certificationText?: string;
    signatureSettings?: {
      penColor?: string;
      backgroundColor?: string;
      requirePassword?: boolean;
    };
  };
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

export function SignaturePadWidget({ field, value, onChange, disabled }: SignaturePadWidgetProps) {
  const signaturePadRef = useRef<SignatureCanvas>(null);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [certAccepted, setCertAccepted] = useState(false);
  const [password, setPassword] = useState('');
  const [signerName, setSignerName] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureStartTime, setSignatureStartTime] = useState<number | null>(null);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const penColor = field.signatureSettings?.penColor || '#000000';
  const backgroundColor = field.signatureSettings?.backgroundColor || '#ffffff';
  const requirePassword = field.signatureSettings?.requirePassword !== false;
  const requireCertification = field.requireCertification !== false;
  const certificationText = field.certificationText || 
    'I certify that my electronic signature is the legally binding equivalent of my handwritten signature.';
  const signatureMeaning = field.signatureMeaning || 'Completed by';

  // Check if user is authenticated
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setCurrentUser(user);
      if (user) {
        setSignerName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }

  const handleSignClick = () => {
    if (disabled || value) return;
    
    // Step 1: Show certification dialog if required
    if (requireCertification && !certAccepted) {
      setShowCertDialog(true);
    } 
    // Step 2: For authenticated users, show password dialog if required
    else if (isAuthenticated && requirePassword) {
      setShowPasswordDialog(true);
    }
    // Step 3: Show signature pad
    else {
      setShowSignDialog(true);
      setSignatureStartTime(Date.now());
    }
  };

  const handleCertificationAccept = () => {
    setCertAccepted(true);
    setShowCertDialog(false);
    
    // Move to password or signature
    if (isAuthenticated && requirePassword) {
      setShowPasswordDialog(true);
    } else {
      setShowSignDialog(true);
      setSignatureStartTime(Date.now());
    }
  };

  const handlePasswordVerify = async () => {
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setIsVerifying(true);
    setPasswordError('');

    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.verified) {
        setShowPasswordDialog(false);
        setPassword('');
        setShowSignDialog(true);
        setSignatureStartTime(Date.now());
      } else {
        setPasswordError('Invalid password');
      }
    } catch (error) {
      setPasswordError('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClearSignature = () => {
    signaturePadRef.current?.clear();
    setStrokeCount(0);
  };

  const handleSaveSignature = async () => {
    if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      return;
    }

    if (!isAuthenticated && !signerName.trim()) {
      toast.error('Name required', {
        description: 'Please enter your name to continue.',
      });
      return;
    }

    setIsSigning(true);

    try {
      // Get signature data as base64 PNG
      const signatureData = signaturePadRef.current.toDataURL('image/png');
      
      // Get canvas dimensions
      const canvas = signaturePadRef.current.getCanvas();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Capture client info
      const clientInfo = await fetch('/api/client-info').then(r => r.json());

      // Calculate signature time
      const signatureTime = signatureStartTime ? Date.now() - signatureStartTime : 0;

      // Build signature object
      const signature = {
        id: nanoid(),
        fieldId: field.id,
        signedBy: signerName.trim(),
        signedById: currentUser?.id || null,
        signedAt: new Date().toISOString(),
        signatureMeaning: signatureMeaning,
        signatureData: signatureData,
        ipAddress: clientInfo.ip || 'unknown',
        userAgent: clientInfo.userAgent || 'unknown',
        deviceType: clientInfo.deviceType || 'unknown',
        certificateAcceptedAt: certAccepted ? new Date().toISOString() : null,
        metadata: {
          strokeCount: strokeCount,
          signatureTime: signatureTime,
          canvasWidth: canvasWidth,
          canvasHeight: canvasHeight
        }
      };

      // Save to form value
      onChange(signature);

      // Close dialog
      setShowSignDialog(false);
      setSignatureStartTime(null);
      setStrokeCount(0);
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Failed to save signature', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleBeginStroke = () => {
    setStrokeCount(prev => prev + 1);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <PenTool className="h-4 w-4" />
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
        <Badge variant="outline" className="ml-2">
          <Shield className="h-3 w-3 mr-1" />
          CFR Compliant
        </Badge>
      </Label>

      {!value ? (
        <Card className="p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-purple-100 p-4">
              <PenTool className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Electronic Signature Required</p>
              <p className="text-sm text-gray-500 mt-1">
                {signatureMeaning} • {requireCertification ? 'Certification required' : ''} {requirePassword && isAuthenticated ? '• Password verification' : ''}
              </p>
            </div>
            <Button 
              type="button"
              onClick={handleSignClick}
              disabled={disabled}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Sign Document
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-green-50 border-2 border-green-200">
          <div className="flex items-start gap-4">
            <img 
              src={value.signatureData} 
              alt="Signature" 
              className="h-20 border border-gray-300 bg-white rounded"
              style={{ minWidth: '150px' }}
            />
            <div className="flex-1 space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="font-medium">Signed by {value.signedBy}</span>
              </div>
              <p className="text-gray-600">{signatureMeaning}</p>
              <p className="text-xs text-gray-500">
                {new Date(value.signedAt).toLocaleString()}
              </p>
              {value.ipAddress && value.ipAddress !== 'unknown' && (
                <p className="text-xs text-gray-400">
                  IP: {value.ipAddress} • {value.deviceType}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Certification Dialog */}
      <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Electronic Signature Certification
            </DialogTitle>
            <DialogDescription>
              This certification is required for CFR compliance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                {certificationText}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox 
                id="cert-accept"
                checked={certAccepted}
                onCheckedChange={(checked) => setCertAccepted(checked as boolean)}
              />
              <Label htmlFor="cert-accept" className="text-sm leading-relaxed cursor-pointer">
                I have read and accept this certification. I understand that my electronic signature is legally binding.
              </Label>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setShowCertDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleCertificationAccept}
              disabled={!certAccepted}
              className="flex-1"
            >
              Accept & Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Verification Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Verify Your Identity
            </DialogTitle>
            <DialogDescription>
              Re-enter your password to authorize this electronic signature.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handlePasswordVerify()}
                placeholder="Enter your password"
                disabled={isVerifying}
              />
              {passwordError && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {passwordError}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setShowPasswordDialog(false);
                setPassword('');
                setPasswordError('');
              }}
              className="flex-1"
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handlePasswordVerify}
              disabled={isVerifying || !password.trim()}
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signature Pad Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-purple-600" />
              Sign Document
            </DialogTitle>
            <DialogDescription>
              {signatureMeaning} • Draw your signature below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!isAuthenticated && (
              <div>
                <Label htmlFor="signer-name">Your Full Name *</Label>
                <Input
                  id="signer-name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isSigning}
                />
              </div>
            )}
            
            <div>
              <Label>Signature *</Label>
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ backgroundColor }}>
                <SignatureCanvas
                  ref={signaturePadRef}
                  canvasProps={{
                    className: 'w-full h-48 touch-none',
                    style: { touchAction: 'none' }
                  }}
                  penColor={penColor}
                  onBegin={handleBeginStroke}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {strokeCount > 0 ? `${strokeCount} strokes` : 'Draw your signature above'}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSignature}
                  disabled={isSigning}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setShowSignDialog(false);
                handleClearSignature();
              }}
              className="flex-1"
              disabled={isSigning}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSaveSignature}
              disabled={isSigning || !signerName.trim() || strokeCount === 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isSigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Signature
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

