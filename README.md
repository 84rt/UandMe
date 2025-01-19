# The U&Me AI Mediator

This is a Next.js application that allows users to record their voice, converts it to text using OpenAI's Whisper API, and then processes the text using GPT-4o to generate responses.

## ✨ Features

- 🎙️ Voice recording using the browser's media API
- 🗣️ Speech-to-text conversion using OpenAI's Whisper API
- 🤖 Text processing using GPT-4o
- ⏱️ Real-time status updates
- 💻 Modern UI with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚀 Deploy on Vercel

The easiest way to deploy this application is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a Git repository
2. Import your project to Vercel
3. Add your OpenAI API key to the environment variables in your Vercel project settings
4. Deploy!


## These are defnitely features _not_ bugs:
- The system default color scheme overwrites the toggle setting for dark/light mode.
- Most of the code (including the prompts) is is in `page.tsx`. The code is designed not to be modular for readability, and definitely not becuase I'm lazy.
- There is no time limit on the recording, the system will keep recording until the user clicks "Stop Recording" (or the recording is stopped by the browser). **This is billing directly to my OpenAI account, please don't abuse this.**


## List absolutely essential features:
- make the title of the page dynamically change color 
- 