import axios from 'axios';

//const OPENAI_KEY = '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';
const OPENAI_KEY = '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';
export async function transcribeAudio(fileUri) {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'audio/mp4',
    name: 'voice.m4a',
  });
  formData.append('model', 'whisper-1');

  const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
  });

  return response.data.text;
}

export async function detectIntent(text) {
  console.log('text----123', text);
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
           "content": "You are a smart assistant that maps user messages to app screens and extracts relevant filter values.\n\nReturn a JSON with:\n- screen: one of Home, FoodLog, Movements, Activity\n- filters: an object containing screen-specific filters\n\nExamples:\n\n1. For FoodLog → filters may include: meal, item, date\n2. For Movements → filters may include: type (e.g. walking, exercise), date\n3. For Activity → filters may include: date_range, metric\n4. For Home → filters is null\n\nAlways return dates in YYYY-MM-DD format. Assume today is 2025-08-04."
          },
          {
            role: 'user',
            content: text,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
      }
    );
    console.log('respo---', res.data);
    return res.data.choices[0].message.content;
  } catch (error) {
    console.error('detectIntent error:', error.response ? error.response.data : error.message);
    throw error;
  }
}
