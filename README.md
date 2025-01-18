# Voice to AI Assistant

This is a Next.js application that allows users to record their voice, converts it to text using OpenAI's Whisper API, and then processes the text using GPT-3.5 to generate responses.

## Features

- Voice recording using the browser's media API
- Speech-to-text conversion using OpenAI's Whisper API
- Text processing using GPT-3.5
- Real-time status updates
- Modern UI with Tailwind CSS

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

## Deploy on Vercel

The easiest way to deploy this application is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a Git repository
2. Import your project to Vercel
3. Add your OpenAI API key to the environment variables in your Vercel project settings
4. Deploy!
# UandMe
