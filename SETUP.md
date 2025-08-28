# AI Chatbot Experiment Setup

This is a Next.js application for conducting AI chatbot experiments with a 2x2 design studying different conversation approaches.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with:
   ```
   DATABASE_URL=your_neon_database_url
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Initialize the database:**
   ```bash
   node scripts/init-db.js
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000** in your browser

## 🧪 Experiment Design

### Four AI Conditions (2x2 Design)

| | **Self-Clone/Monologue** | **Companion/Dialogue** |
|---|---|---|
| **Sycophantic** | Inner Cheerleader (Blue) | Supportive Friend (Pink) |
| **Antagonistic** | Tough Self-Critic (Green) | Reality Check Friend (Yellow) |

### Flow
1. **Home Page** - Welcome and start session
2. **Situation Description** - User describes their challenge
3. **Baseline Survey** - Pre-conversation measurements (3 items)
4. **AI Selection** - Choose from 4 colored bot options
5. **Chat Session** - 10-exchange conversation with selected AI
6. **Emotion Landscape** - Metaphoric journey mapping assessment
7. **Follow-up Survey** - Post-conversation measurements (3 items + open response)
8. **Completion** - Thank you page

## 🤖 AI Conditions

### Inner Cheerleader (Blue - Sycophantic Self-Clone)
- Mirrors user's voice and style
- Provides positive self-talk reinforcement
- Builds confidence through echoed validation
- Example: "I'm amazing and deserve respect—everyone will agree with my points..."

### Tough Self-Critic (Green - Antagonistic Self-Clone)  
- Challenges assumptions with humor
- Uses desensitization through counterarguments
- Exposes flaws to reshape self-concept
- Example: "Haha, that's my usual cop-out—but what if they push back?..."

### Supportive Friend (Pink - Sycophantic Companion)
- Acts as encouraging friend in dialogue
- Provides relational affirmation
- Gentle guidance toward confidence
- Example: "You're so insightful and kind—they'll appreciate that!..."

### Reality Check Friend (Yellow - Antagonistic Companion)
- Gives honest, caring reality checks
- Uses gentle teasing and truth-telling
- Points out blind spots with love, not malice
- Example: "Come on, you know what I think? They might respect your honesty more than you think..."

## 📊 Data Collection

- Session metadata and progression
- All chat messages with timestamps
- Pre/post survey responses on 7-point Likert scales
- **Emotion landscape assessment:**
  - AI-generated metaphor phrases (starting & destination)
  - User-edited metaphor phrases (if modified)
  - Journey progress (1-7 scale)
  - Willingness to continue mapping (if not at end)
- Open-response qualitative feedback (minimum 20 characters)
- User interaction tracking (page views, selections)

## 🔧 Technical Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes
- **Database:** Neon (PostgreSQL)
- **AI:** OpenAI GPT-4o-mini
- **Styling:** Tailwind CSS with custom color scheme

## 📁 Key Files

- `/src/lib/chatbot-prompts.ts` - AI system prompts and conditions
- `/src/app/chat/page.tsx` - Main chat interface
- `/src/app/experiment/page.tsx` - AI selection grid
- `/src/app/api/chat/route.ts` - OpenAI API integration
- `/src/app/survey/page.tsx` - Pre/post surveys

## 🎯 Features

- ✅ Four distinct AI personalities with carefully crafted system prompts
- ✅ Colorful, intuitive UI with PNG avatars for each bot
- ✅ 10-message conversation limit with hard stop
- ✅ Pre/post survey measurement system
- ✅ Full conversation logging and analytics
- ✅ Responsive design for desktop and mobile
- ✅ Complete experimental flow from start to finish

The system is ready for OpenAI API integration - just add your API key to the environment variables.
