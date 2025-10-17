# Image Upload Feature - Build Forms from Photos

## Overview
Upload a photo or screenshot of a paper form, checklist, or whiteboard sketch, and let AI automatically convert it into a digital form.

## How It Works

### User Flow
1. Open the Form Builder
2. Click the **image icon** (📷) next to the Excel upload button
3. Select an image file (JPG, PNG, etc.)
4. AI analyzes the image and extracts all questions/fields
5. Digital form is created automatically

### Under the Hood
1. **Image Processing**: Image is converted to base64 format
2. **Claude Vision**: Image is sent to Claude 3.7 Sonnet with vision capabilities
3. **Text Extraction**: Claude reads all text in the image
4. **Field Detection**: AI identifies each question and determines field types
5. **Form Generation**: AI outputs CREATE_FORM command with all fields
6. **Rendering**: Form appears in the builder, ready to edit

## Supported Image Formats
- JPG/JPEG
- PNG
- GIF
- WEBP
- Any format supported by HTML5 `<input type="file" accept="image/*">`

## Use Cases

### 1. Paper Checklists
**Before**: Kitchen safety checklist on paper
**After**: Digital checklist with Yes/No questions

### 2. Scanned Forms
**Before**: PDF scan of registration form
**After**: Interactive web form with all fields

### 3. Screenshots
**Before**: Screenshot of competitor's form
**After**: Your own version of the form

### 4. Whiteboard Sketches
**Before**: Photo of form sketch on whiteboard
**After**: Functional form ready for deployment

## AI Prompting
When you upload an image, the AI receives this prompt:

```
I've uploaded an image of a form or checklist. Please analyze this image and extract all the questions/fields you can see. Then create a digital form with those fields.

**Instructions:**
1. Read all text in the image carefully
2. Identify each question or field
3. Determine the appropriate field type for each (text, yes/no, multiple choice, number, date, etc.)
4. Preserve the original order and wording
5. Create the form using CREATE_FORM with all fields

Please extract and build the form now.
```

## Technical Implementation

### Frontend (ai-chat-panel.tsx)
```typescript
// Image upload handler
const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;
  
  // Convert to base64
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Image = e.target?.result as string;
    
    // Send to API with vision prompt
    await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content: prompt }],
        image: base64Image,
        currentPage,
        currentFields,
      }),
    });
  };
  reader.readAsDataURL(file);
};
```

### Backend (api/chat/route.ts)
```typescript
// Accept image parameter
const { messages, image } = await req.json();

// Format message for Claude Vision
if (image && messages.length > 0) {
  const lastMessage = messages[messages.length - 1];
  processedMessages = [
    ...messages.slice(0, -1),
    {
      role: lastMessage.role,
      content: [
        { type: 'image', image: image }, // base64 image
        { type: 'text', text: lastMessage.content },
      ],
    },
  ];
}

// Send to Claude with vision model
const result = streamText({
  model: anthropic('claude-3-7-sonnet-20250219'),
  system: FORM_BUILDER_SYSTEM_PROMPT,
  messages: processedMessages,
});
```

## Limitations & Future Enhancements

### Current Limitations
- Single image per upload
- No OCR confidence scores shown
- Can't preview image before upload
- English text only (Claude supports other languages but not tested)

### Future Enhancements
- [ ] Show image preview in chat
- [ ] Support multiple images (multi-page forms)
- [ ] OCR confidence scoring
- [ ] Image annotation (mark areas to extract)
- [ ] Batch processing
- [ ] Image quality warnings
- [ ] Support for handwritten forms

## Troubleshooting

### "Please upload an image file"
- Make sure the file is JPG, PNG, or another image format
- Try a different image file

### AI doesn't extract all fields
- Ensure image is clear and high-resolution
- Try retaking the photo with better lighting
- Make sure text is readable (not blurry)
- Manually add missing fields after upload

### Form looks different than image
- AI interprets form structure, may reorganize
- Review and adjust field order in builder
- Edit field types if AI chose incorrectly

## Demo Images
Try these sample use cases:
- 📋 Daily inspection checklist
- 📝 Temperature log form
- ✅ Safety audit sheet
- 📊 Survey questionnaire
- 🍽️ Dining room checklist

## Developer Notes

### Model Used
- **Model**: Claude 3.7 Sonnet (claude-3-7-sonnet-20250219)
- **Vision**: Yes, multimodal (text + images)
- **Max Image Size**: ~5MB recommended
- **Supported Formats**: JPG, PNG, GIF, WEBP

### API Integration
Uses Vercel AI SDK with Anthropic provider:
```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
```

### Cost Considerations
- Vision API calls cost more than text-only
- Recommend compressing large images before upload
- Consider caching results for repeat uploads

---

**Last Updated**: October 17, 2025
**Status**: ✅ Production Ready

