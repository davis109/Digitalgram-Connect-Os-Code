import Chat from '../models/chatModel.js';
import axios from 'axios';

// @desc    Create a new chat
// @route   POST /api/chat
// @access  Private
export const createChat = async (req, res) => {
  try {
    const { title, category, language } = req.body;
    const userId = req.user._id;

    const chat = await Chat.create({
      userId,
      title: title || 'New Conversation',
      category: category || 'general',
      language: language || req.user.language || 'en',
      messages: []
    });

    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all chats for a user
// @route   GET /api/chat
// @access  Private
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('title category language createdAt updatedAt');

    res.status(200).json({
      success: true,
      count: chats.length,
      data: chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single chat
// @route   GET /api/chat/:id
// @access  Private
export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Check if user owns the chat
    if (chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Send message to chat
// @route   POST /api/chat/:id/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const chatId = req.params.id;

    if (!content) {
      return res.status(400).json({ success: false, message: 'Please provide message content' });
    }

    let chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Check if user owns the chat
    if (chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this chat' });
    }

    // Add user message
    const userMessage = {
      content,
      role: 'user',
      timestamp: Date.now()
    };

    chat.messages.push(userMessage);
    await chat.save();

    // Get AI response
    const aiResponse = await getAIResponse(chat.messages, chat.language, chat.category);

    // Add AI message
    const assistantMessage = {
      content: aiResponse,
      role: 'assistant',
      timestamp: Date.now()
    };

    chat.messages.push(assistantMessage);
    await chat.save();

    res.status(200).json({
      success: true,
      data: {
        userMessage,
        assistantMessage
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete chat
// @route   DELETE /api/chat/:id
// @access  Private
export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Check if user owns the chat
    if (chat.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this chat' });
    }

    await chat.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper function to get AI response using Gemini API
async function getAIResponse(messages, language, category) {
  try {
    // Format messages for Gemini API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Add system message with context
    const systemMessage = {
      role: 'system',
      parts: [{ text: getSystemPrompt(language, category) }]
    };

    const apiMessages = [systemMessage, ...formattedMessages];

    // Call Gemini API
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        contents: apiMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        }
      }
    );

    // Extract and return the response text
    const aiResponseText = response.data.candidates[0].content.parts[0].text;
    return aiResponseText;
  } catch (error) {
    console.error('AI response error:', error);
    return 'I apologize, but I am having trouble processing your request right now. Please try again later.';
  }
}

// Helper function to generate system prompt based on language and category
function getSystemPrompt(language, category) {
  const isHindi = language === 'hi';
  
  // Base prompt
  let prompt = isHindi
    ? 'आप एक सहायक AI हैं जो ग्रामीण भारत के लोगों को जानकारी प्रदान करने के लिए डिज़ाइन किया गया है। आपका उद्देश्य सरल, स्पष्ट और उपयोगी जानकारी प्रदान करना है। हिंदी में उत्तर दें और जटिल शब्दों से बचें।'
    : 'You are an assistant AI designed to provide information to people in rural India. Your goal is to provide simple, clear, and helpful information. Avoid complex terminology.';

  // Add category-specific instructions
  switch (category) {
    case 'agriculture':
      prompt += isHindi
        ? ' कृषि, फसल प्रबंधन, मिट्टी के स्वास्थ्य, सिंचाई, और टिकाऊ खेती प्रथाओं के बारे में जानकारी प्रदान करें।'
        : ' Provide information about agriculture, crop management, soil health, irrigation, and sustainable farming practices.';
      break;
    case 'health':
      prompt += isHindi
        ? ' स्वास्थ्य, स्वच्छता, पोषण, बीमारी की रोकथाम, और प्राथमिक चिकित्सा के बारे में जानकारी प्रदान करें।'
        : ' Provide information about health, hygiene, nutrition, disease prevention, and first aid.';
      break;
    case 'education':
      prompt += isHindi
        ? ' शिक्षा, साक्षरता, स्कूल, छात्रवृत्ति, और शिक्षा के अवसरों के बारे में जानकारी प्रदान करें।'
        : ' Provide information about education, literacy, schools, scholarships, and educational opportunities.';
      break;
    case 'schemes':
      prompt += isHindi
        ? ' सरकारी योजनाओं, सब्सिडी, कल्याणकारी कार्यक्रमों, और वित्तीय समावेशन के बारे में जानकारी प्रदान करें।'
        : ' Provide information about government schemes, subsidies, welfare programs, and financial inclusion.';
      break;
    case 'weather':
      prompt += isHindi
        ? ' मौसम, जलवायु, मौसम की भविष्यवाणी, और मौसम से संबंधित आपदाओं के बारे में जानकारी प्रदान करें।'
        : ' Provide information about weather, climate, weather forecasting, and weather-related disasters.';
      break;
    case 'employment':
      prompt += isHindi
        ? ' रोजगार के अवसरों, कौशल विकास, स्व-रोजगार, और आजीविका के बारे में जानकारी प्रदान करें।'
        : ' Provide information about employment opportunities, skill development, self-employment, and livelihoods.';
      break;
    default:
      // General category
      break;
  }

  return prompt;
}