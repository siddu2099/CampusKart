const { GoogleGenerativeAI } = require('@google/generative-ai');

const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('Missing GEMINI_API_KEY environment variable');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are a helpful e-commerce assistant for the online platform 'CampusKart'. 
You should help users with shopping queries, provide product recommendations, and answer questions about navigating the store.
Keep your responses concise, friendly, and helpful. Be polite.
Reply to the following user message: ${message}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error('Error in chat processing:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
};

module.exports = {
    chatWithAI,
};
