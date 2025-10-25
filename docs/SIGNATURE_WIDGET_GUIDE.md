# Signature Widget User Guide
## V7 Form Builder

**Version:** 1.0  
**Last Updated:** October 25, 2025

---

## Overview

The Signature Widget enables CFR-compliant electronic signatures in your forms. Perfect for food safety audits, compliance documentation, and any forms requiring legally binding signatures.

**Key Features:**
- ✅ 21 CFR Part 11 compliant
- ✅ Biometric signature capture
- ✅ Multi-factor authentication
- ✅ Complete audit trails
- ✅ Works on desktop, tablet, and mobile

---

## Quick Start

### Adding a Signature Field

1. Open the **Form Builder**
2. Look for the **Advanced** section in the left panel
3. Find the **Signature** widget (purple color)
4. **Drag it** onto your form, or **click the + button** to add it to the top

That's it! Your form now has a CFR-compliant signature field.

---

## Configuration Options

### Basic Settings

#### Field Label
- Default: "Signature"
- Customize to match your use case (e.g., "Manager Approval", "Inspector Signature")

#### Required Field
- Toggle to make signature mandatory
- Recommended: **Always required** for compliance

#### Signature Meaning
- Default: "Completed by"
- Options: "Approved by", "Reviewed by", "Authorized by", etc.
- **Important:** This appears on signed documents for compliance

### Advanced Settings

#### Certification Text
The legal text users must accept before signing.

**Default:**
> "I certify that my electronic signature is the legally binding equivalent of my handwritten signature."

**Customization:** You can modify this per form, but ensure it maintains legal equivalence language.

#### Signature Settings

**Pen Color**
- Default: Black (#000000)
- Can be changed for visibility preferences

**Background Color**
- Default: White (#FFFFFF)
- Maintain high contrast for signature clarity

**Require Password**
- Default: **Enabled**
- For authenticated users, requires password re-entry
- Provides two-factor authentication
- **Recommended:** Keep enabled for compliance

---

## Using the Signature Widget

### For Form Creators

1. **Add the widget** to your form
2. **Configure the label** (what should signers see?)
3. **Set signature meaning** (what does this signature represent?)
4. **Review certification text** (legal language)
5. **Publish your form**
6. **Test the signature flow** before going live

### For Form Fillers

#### Step 1: Complete the Form
Fill out all required fields before reaching the signature.

#### Step 2: Certification
When you click "Sign Document", you'll see a certification dialog:
- Read the legal text carefully
- Check the acceptance box
- Click "Accept & Continue"

#### Step 3: Authentication (for logged-in users)
- Enter your password when prompted
- This verifies your identity
- Click "Verify & Continue"

#### Step 4: Sign
- A signature pad appears
- Draw your signature using:
  - **Mouse** (desktop)
  - **Stylus** (tablet)
  - **Finger** (mobile)
- Click "Clear" if you want to redo it
- Click "Save Signature" when satisfied

#### Step 5: Submit
- Review your signature on the form
- Submit the form
- **Note:** Once submitted, signatures cannot be changed

---

## Viewing Signatures

### In Submissions

1. Go to the **Report** tab in Form Builder
2. Select a submission
3. Signatures appear with:
   - Signature image
   - Signer name
   - Date and time
   - IP address and device info
   - Compliance status badge

### Compliance Information

Each signature displays:
- ✅ **Compliance Score** (0-100)
- ✅ **Verification Status**
- ✅ **Full Audit Trail**
- ✅ **Technical Details**

Click the **expand** arrow to see complete details.

---

## Best Practices

### For Food Safety & Compliance

1. **Always require signatures** for critical forms
2. **Use descriptive labels** ("Health Inspector Signature")
3. **Set appropriate meaning** ("Inspected by", "Approved by")
4. **Test on actual devices** that will be used in production
5. **Train users** on the signature process
6. **Review signatures regularly** in submissions
7. **Export signed forms** for regulatory records

### Form Design Tips

**Signature Placement:**
- Place signature fields **at the end** of forms
- Use **Group** widgets to organize sections
- Put signature **after** all questions are answered

**Multiple Signatures:**
- Add multiple signature fields for different approvers
- Label each clearly (e.g., "Employee Signature", "Manager Signature")
- Each signature captures independently

**Mobile Optimization:**
- Test signature capture on mobile devices
- Ensure form fields are mobile-friendly
- Consider landscape orientation for signatures

---

## Common Use Cases

### Food Safety Inspection

```
Form: Daily Food Safety Checklist
Fields:
- Temperature readings
- Sanitation checklist  
- Equipment check items
Signature:
  Label: "Inspector Signature"
  Meaning: "Inspected by"
  Required: Yes
```

### Equipment Maintenance

```
Form: Equipment Maintenance Log
Fields:
- Equipment ID
- Maintenance performed
- Parts replaced
Signatures:
  1. "Technician Signature" (Completed by)
  2. "Supervisor Signature" (Reviewed by)
```

### Quality Audit

```
Form: Quality Assurance Audit
Fields:
- Audit findings
- Corrective actions
- Follow-up required
Signature:
  Label: "Auditor Signature"
  Meaning: "Audited by"
  Required: Yes
```

---

## Troubleshooting

### "Signature Pad Won't Appear"

**Cause:** Certification not accepted or authentication failed

**Solution:**
1. Ensure certification checkbox is checked
2. Verify password is correct
3. Clear browser cache and try again

### "Signature Looks Pixelated"

**Cause:** Low resolution capture

**Solution:**
1. Draw signature slowly and clearly
2. Use a stylus if available on tablets
3. Ensure canvas area is fully visible

### "Can't Sign on Mobile"

**Cause:** Touch input not registering

**Solution:**
1. Enable touch permissions in browser
2. Try landscape orientation
3. Use native browser (not in-app browser)

### "Signature Was Not Saved"

**Cause:** Form validation error or network issue

**Solution:**
1. Check all required fields are filled
2. Verify internet connection
3. Try signing again
4. Contact support if issue persists

---

## Security & Privacy

### Data Protection

- Signatures are **encrypted** in transit (HTTPS/TLS)
- Stored securely in **PostgreSQL database**
- **Access controlled** by workspace permissions
- **Audit trails** maintained for all actions

### Who Can See Signatures?

- **Form owner** and **workspace members** with appropriate permissions
- Signatures are **NOT public** even on public forms
- **Submitters** can see their own signatures in confirmation

### Data Retention

- Signatures are **permanently linked** to form submissions
- Cannot be deleted independently
- Retained according to your workspace's data retention policy
- Can be exported for archival purposes

---

## Compliance Notes

### 21 CFR Part 11 Requirements

Our signature widget meets FDA requirements for:

1. ✅ **Unique signatures** - Each signature has unique ID
2. ✅ **Identity verification** - Password authentication
3. ✅ **Certification** - Legal acceptance dialog
4. ✅ **Signature manifestation** - Name, date, meaning displayed
5. ✅ **Audit trails** - Complete logging of all actions
6. ✅ **Record linking** - Signatures permanently bound to records

### When to Use

**Use CFR-compliant signatures for:**
- FDA-regulated forms
- Food safety audits and inspections
- Quality assurance documentation
- Manufacturing batch records
- Clinical trial documentation
- Any legal or regulatory requirement

**Optional for:**
- Internal surveys
- Feedback forms
- Non-regulatory applications

---

## API Integration

### Accessing Signature Data

Signatures are included in form submission data:

```json
{
  "submission_id": "...",
  "data": {
    "field_name": "value",
    "signature_field": {
      "id": "sig-abc123",
      "signedBy": "John Doe",
      "signedAt": "2025-10-25T14:30:00Z",
      "signatureMeaning": "Approved by",
      "signatureData": "data:image/png;base64,...",
      "ipAddress": "192.168.1.1",
      "deviceType": "desktop"
    }
  },
  "signatures": [...],
  "signature_audit": [...]
}
```

### Webhook Events

Signatures trigger webhook events for integrations:
- `form.submitted` - Includes signature data
- Payload contains full signature details
- Audit trail included for compliance

---

## FAQs

**Q: Can signatures be edited after submission?**  
A: No. Once a form is submitted, signatures are permanent and cannot be modified. This ensures integrity and compliance.

**Q: What happens if I forget my password during signing?**  
A: You'll need to reset your password before you can sign. Signature authentication cannot be bypassed for security reasons.

**Q: Can I use this for legal documents?**  
A: Yes. Our signatures are designed to be legally binding and CFR-compliant. However, consult your legal counsel for specific use cases.

**Q: How long are signatures retained?**  
A: Signatures are retained for the life of the form submission, according to your workspace's retention policy. Minimum recommended: 3 years for regulatory compliance.

**Q: Can I export signatures?**  
A: Yes. Export submissions to PDF (includes signature images) or JSON (includes full signature data and audit trails).

**Q: Do signatures work offline?**  
A: No. An internet connection is required for signature capture, authentication, and audit trail creation.

**Q: Is there a signature limit per form?**  
A: No limit. Add as many signature fields as needed for your workflow.

**Q: Can I customize the signature pad size?**  
A: The signature pad automatically adapts to screen size. It's optimized for usability across all devices.

---

## Support

### Getting Help

**Documentation:**
- [CFR Compliance Guide](./CFR_COMPLIANCE.md)
- [Form Builder Guide](../README.md)

**Contact:**
- Email: support@v7forms.com
- Response time: 24 hours
- Emergency support available

### Feedback

We're constantly improving! Send suggestions to feedback@v7forms.com

---

## Changelog

### Version 1.0 (October 25, 2025)
- ✅ Initial release
- ✅ Biometric signature capture
- ✅ CFR Part 11 compliance
- ✅ Multi-factor authentication
- ✅ Complete audit trails
- ✅ Mobile & tablet support

---

**Happy Signing! 🎉**


