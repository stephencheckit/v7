# Video AI Form Filler Setup

## Overview
The Video AI Form Filler uses OpenAI's GPT-4 Vision API to automatically analyze video snapshots and fill in form answers based on what the camera sees.

## Setup Instructions

### 1. Get an OpenAI API Key
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (you'll need it in the next step)

### 2. Add API Key to Environment Variables
Create a `.env.local` file in the project root with the following content:

```bash
# OpenAI API Key for Video AI Form Filler
OPENAI_API_KEY=sk-your-actual-api-key-here

# Anthropic API Key (if not already set)
ANTHROPIC_API_KEY=your-anthropic-key-here
```

**Important:** Never commit `.env.local` to version control. It's already in `.gitignore`.

### 3. Restart the Development Server
```bash
npm run dev
```

## How to Use

1. **Build a Form**
   - Go to Forms → Create New Form
   - Add questions (or upload an image to auto-generate)
   - Click "Preview"

2. **Start Video Analysis**
   - In the preview page, click "Start Camera"
   - Allow camera permissions when prompted
   - Position the camera to show the inspection area
   - Click "Start Recording"

3. **Let AI Fill the Form**
   - Every 4 seconds, a snapshot is captured
   - AI analyzes the image against all form questions
   - Answers with >80% confidence are automatically filled
   - AI-filled fields show a blue tint and "AI Filled" badge

4. **Review & Submit**
   - Manually edit any AI-filled answers if needed
   - Add answers to questions AI couldn't determine
   - Submit the form

## Features

### Real-Time Analysis
- Captures video snapshots every 4 seconds
- Sends to OpenAI Vision API with form questions
- Only fills answers when AI is >80% confident

### Visual Feedback
- **Blue background**: AI-filled field
- **Sparkle icon**: "AI Filled" badge
- **Recording indicator**: Red dot + "Recording"
- **Stats display**: Snapshots captured, questions answered

### Supported Question Types
- **Yes/No (Binary)**: AI responds "Yes" or "No"
- **Multiple Choice**: AI selects exact option text
- **Text Fields**: AI provides brief descriptions
- **Number Fields**: AI provides numeric values
- **Dropdowns**: AI selects from dropdown options

## Cost Estimate

OpenAI Vision API pricing (as of 2025):
- **GPT-4o**: ~$0.01 per image
- **4-second intervals**: 15 snapshots/minute
- **10-minute inspection**: ~$1.50

For lower costs, consider:
- Adjusting snapshot interval (5-6 seconds instead of 4)
- Using GPT-4o-mini for simpler forms
- Starting/stopping recording as needed

## Example Use Cases

### Food Safety Inspection
**Question:** "Are employees wearing proper hairnets?"
- AI sees kitchen staff in video
- If hairnets clearly visible → "Yes" (95% confidence)
- If unclear/not visible → leaves blank (40% confidence)

### Equipment Check
**Question:** "Fire extinguisher pressure gauge status"
- AI sees pressure gauge in green zone → "Normal"
- AI sees gauge in red zone → "Low Pressure"
- Can't see gauge → leaves blank

### Temperature Monitoring
**Question:** "Refrigerator temperature display"
- AI reads digital display → "38°F"
- Display not visible → leaves blank

## Troubleshooting

### Camera Won't Start
- Check browser permissions (Settings → Privacy → Camera)
- Ensure no other app is using the camera
- Try refreshing the page

### AI Not Filling Answers
- Ensure `.env.local` has `OPENAI_API_KEY` set
- Check browser console for API errors
- Verify the camera can clearly see the inspection area
- Questions need clear visual evidence to answer

### All Questions Blank
- AI requires >80% confidence to fill answers
- If nothing is clearly visible, all answers remain blank
- This is expected behavior - manual entry is always an option

## Technical Details

- **Model**: GPT-4o (latest vision model)
- **Snapshot Resolution**: 1280x720
- **Snapshot Format**: JPEG, base64-encoded
- **Confidence Threshold**: 80%
- **Analysis Timeout**: ~3-5 seconds per snapshot

## Privacy & Security

- All video processing happens client-side (browser)
- Only snapshots (not continuous video) are sent to OpenAI
- Snapshots are not stored after analysis
- API key stored in local environment variables only
- No video data is saved to the database

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API key is correctly set in `.env.local`
3. Ensure camera permissions are granted
4. Test with clear, well-lit inspection areas

