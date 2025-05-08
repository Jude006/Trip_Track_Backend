// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const axios = require('axios');

// // Your Hugging Face API key from environment variable
// const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
// console.log('Hugging Face Key:', HUGGINGFACE_API_KEY);

// // Optional: very basic check if message is about travel
// const isTravelRelated = (msg) =>
//   /(budget|itinerary|plan|suggest|trip|travel|stay|hotel|vacation|tour)/i.test(msg);

// router.post('/ask-ai', authMiddleware, async (req, res) => {
//   try {
//     const { message, tripDetails } = req.body;

//     // Determine prompt based on message type
//     const prompt = isTravelRelated(message)
//       ? `You are a travel planning assistant. The user is planning a trip with these details:
// Destination: ${tripDetails?.destination || 'Not specified'}
// Budget: ${tripDetails?.budget || 'Not specified'}
// Duration: ${tripDetails?.duration || 'Not specified'} days
// Travelers: ${tripDetails?.travelers || 'Not specified'}

// User question: ${message}

// Provide a helpful, concise response:`
//       : message; // For normal AI response (not trip-related)

//     // Call Hugging Face API
//     const response = await axios.post(
//       'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
//       { inputs: prompt },
//       {
//         headers: {
//           Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
//         },
//       }
//     );

//     // Return AI response to client
//     res.json({ response: response.data[0]?.generated_text || 'No response from AI.' });
//   } catch (error) {
//     console.error('Hugging Face AI error:', error?.response?.data || error.message);
//     res.status(500).json({ error: 'AI service unavailable', details: error?.response?.data || error.message });
//   }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios');

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

router.post('/ask-ai', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) { 
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      { inputs: message },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
      }
    ); 

    const generatedText = response.data?.[0]?.generated_text || 'No response generated';
    res.json({ response: generatedText });

  } catch (error) {
    console.error('Hugging Face AI error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'AI service unavailable', details: error?.response?.data || error.message });
  }
});

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const axios = require('axios');

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// router.post('/ask-ai', authMiddleware, async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (!message) {
//       return res.status(400).json({ error: 'Message is required' });
//     }

//     const response = await axios.post(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         model: 'gpt-3.5-turbo',
//         messages: [
//           { role: 'system', content: 'You are a helpful assistant.' },
//           { role: 'user', content: message }
//         ],
//         temperature: 0.7
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${OPENAI_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     const generatedText = response.data.choices[0].message.content;
//     res.json({ response: generatedText });

//   } catch (error) {
//     console.error('OpenAI error:', error?.response?.data || error.message);
//     res.status(500).json({ error: 'AI service unavailable', details: error?.response?.data || error.message });
//   }
// });

// module.exports = router;
 