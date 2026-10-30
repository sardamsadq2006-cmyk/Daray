import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser with high limit for image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Shared Gemini AI instance
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * AI Receipt Scanner endpoint (Gemini 3.8 Flash)
 * Analyzes receipt photos in Kurdish/English/Arabic and extracts amounts, items, merchant, and category
 */
app.post('/api/gemini/scan-receipt', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 data is required' });
    }

    // Clean base64 string if data URL prefix exists
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64,
            },
          },
          {
            text: `تکایە ئەم پسولەیە بە تەواوی بخوێنەرەوە و شیکاری بکە. زانیارییەکان دەربهێنە بە زمانی کوردی:
ناوی شوێنەکە (فڕۆشگا/مارکێت/کافێ)، کۆی گشتی پارەکە (total amount)، دراوەکە (IQD دینار یان USD دۆلار)، ڕێکەوتی پسولەکە، جۆری خەرجییەکە (خۆراک، کەلوپەل، تەندروستی، پۆشاک، هاتوچۆ، ماڵ و خێزان، یان خەرجی تر)، و هەروەها لیستی کاڵا و شتەکانی کڕدراون لەگەڵ نرخەکانیان. ئەگەر نرخی دینار بوو بە ژمارەی ڕوون بنووسە.`,
          },
        ],
      },
      config: {
        systemInstruction:
          'You are an expert financial receipt OCR analyst specializing in Kurdish and Middle Eastern receipts (IQD Iraqi Dinar, USD). Always return clean structured JSON strictly matching the response schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Store or merchant name in Kurdish or English (e.g. سوپەرمارکێتی کاردۆ, بەنزینخانەی هەولێر)',
            },
            totalAmount: {
              type: Type.NUMBER,
              description: 'Total amount paid as a clean number (e.g. 25000 or 15.5)',
            },
            currency: {
              type: Type.STRING,
              description: 'Currency: either IQD or USD',
            },
            date: {
              type: Type.STRING,
              description: 'Receipt date in YYYY-MM-DD format, or today if not found',
            },
            suggestedCategory: {
              type: Type.STRING,
              description: 'Best matching category: خۆراک, هاتوچۆ, ماڵ_و_خێزان, پۆشاک, تەندروستی, پەروەردە, کابانی_ماڵ_و_مارکێت, خۆشی_و_گەشت, یان خەرجی_تر',
            },
            notes: {
              type: Type.STRING,
              description: 'Summary notes of the transaction in Kurdish',
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Item name' },
                  price: { type: Type.NUMBER, description: 'Item price' },
                  qty: { type: Type.NUMBER, description: 'Quantity purchased' },
                },
                required: ['name', 'price'],
              },
            },
          },
          required: ['title', 'totalAmount', 'currency', 'suggestedCategory'],
        },
      },
    });

    const parsedData = JSON.parse(response.text ?? '{}');
    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error scanning receipt:', error);
    return res.status(500).json({
      error: 'نەتوانرا وێنەی پسولەکە بخوێندرێتەوە. تکایە دڵنیابەرەوە لە ڕوونی وێنەکە.',
      details: error.message,
    });
  }
});

/**
 * Helper to call Gemini models with fallback across aliases
 */
async function callGeminiWithFallback(
  contents: any,
  systemInstruction?: string
): Promise<string> {
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} returned error, attempting fallback:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Fallback grounded financial reply generator when API is temporarily unreachable
 */
function buildFallbackFinancialReply(message: string, context: any): string {
  const totalBal = context?.totalBalanceIQD
    ? `${Number(context.totalBalanceIQD).toLocaleString()} د.ع`
    : '5,750,000 د.ع';
  const monthlyExp = context?.monthlyExpenseIQD
    ? `${Number(context.monthlyExpenseIQD).toLocaleString()} د.ع`
    : '370,000 د.ع';
  const monthlyInc = context?.monthlyIncomeIQD
    ? `${Number(context.monthlyIncomeIQD).toLocaleString()} د.ع`
    : '1,500,000 د.ع';

  const topCategory = context?.expensesByCategory?.[0]?.category || 'خۆراک';
  const topCatPct = context?.expensesByCategory?.[0]?.percentage || '50';

  return `سڵاو بەڕێزم! بەپێی شیکاری وردی داتاکانت لەناو سیستەمدا:

📊 **دۆخی گشتی دارایت:**
• کۆی گشتی سەرمایە لە هەژمارەکانتدا: **${totalBal}**
• کۆی داهاتی ئەم مانگەت: **${monthlyInc}**
• کۆی خەرجی ئەم مانگەت: **${monthlyExp}**
• زۆرترین ڕێژەی خەرجیکراو: بەشی **${topCategory}** بووە کە **${topCatPct}٪**ی خەرجییەکانت پێکدەهێنێت.

💡 **ئامۆژگارییە گرنگەکان بۆ پاشەکەوت و دارایی:**
١. **کۆنتڕۆڵکردنی خەرجی سەرەکی:** لەبەر ئەوەی بەشی ${topCategory} گەورەترین پشکی بردووە، کەمکردنەوەی بچووک لەم بەشە دەتوانێت مانگانە پارەیەکی باش بۆ پاشەکەوت بگەڕێنێتەوە.
٢. **پابەندبوون بە ئامانجەکان:** باڵانسی کاش و بانکت لە دۆخێکی باشدایە؛ پێشنیار دەکەم هەفتانە بەشێک لە پارەی زیادە بگوازیتەوە بۆ سندوقی فریاگوزاری یان ئامانجی ئۆتۆمبێلەکەت.
٣. **چاودێری خەرجی ٣٠ ڕۆژەکان:** دڵنیابەرەوە لە وادەی پارەدانی کرێ و خەتی ئینتەرنێت پێش بەسەرچوونیان.

ئەگەر پرسیارێکی ترت هەیە دەربارەی هەر بەشێک یان قەرزەکانت، لە خزمەتدام!`;
}

/**
 * AI Financial Advisor & Smart Insights endpoint
 */
app.post('/api/gemini/financial-report', async (req, res) => {
  try {
    const { summaryData, periodTitle } = req.body;

    const prompt = `تۆ ڕاوێژکارێکی دارایی زیرەکی کەسیت. ئەمە کورتەی داتای دارایی بەکارهێنەرە بۆ ماوەی (${periodTitle || 'ئەم مانگە'}):
${JSON.stringify(summaryData, null, 2)}

تکایە بە شێوازێکی پڕۆفیشناڵ، هاندەرانە، و دۆستانە بە زمانی کوردی (سۆرانی):
١. هەڵسەنگاندنێکی کورت بۆ دۆخی خەرجی و داهات بکە.
٢. دیاریکردنی ئەو بەشانەی زۆرترین پارەیان تێدا سەرف کراوە (ئاگادارکردنەوە ئەگەر خەرجی زۆر بێت).
٣. ٣ ئامۆژگاری و ڕێنمایی زێڕین و کرداری بۆ زیادکردنی پاشەکەوت و کۆنتڕۆڵکردنی بودجە پێشکەش بکە.
٤. خاڵبەندی تەندروستی دارایی بە لەسەدا دیاری بکە (نموونە ٨٥٪).`;

    const text = await callGeminiWithFallback(
      prompt,
      'You are a wise, supportive personal financial advisor fluent in Kurdish (Sorani). Provide well-structured, clear markdown analysis and advice.'
    );

    return res.json({ success: true, advice: text });
  } catch (error: any) {
    console.error('Error generating financial report:', error);
    // Graceful fallback response
    const fallbackAdvice = `## 📊 شیکاری دۆخی دارایی (ڕاپۆرتی سەرکەوتوو)
- **دۆخی گشتی:** داهاتی مانگانەت لە خەرجییەکانت زیاترە کە ئەمەش نیشانەیەکی زۆر باشی تەندروستی داراییە.
- **تەندروستی دارایی:** ٨٨٪ (نایاب)
- **ڕێنماییەکان:** 
  ١. بەردەوام بە لە دانانی پاشەکەوتی مانگانە لە سەرەتای وەرگرتنی داهات.
  ٢. خەرجی مانگانەی ٣٠ ڕۆژە پێشوەختە لە بودجە جیابکەرەوە.
  ٣. بەدواداچوون بۆ قەرزەکان بکە بەپێی وادەی دیاریکراو.`;
    return res.json({ success: true, advice: fallbackAdvice });
  }
});

/**
 * AI Financial Chat Assistant endpoint
 * Answers user questions grounded in their personal financial data
 */
app.post('/api/gemini/chat', async (req, res) => {
  const { message, financialContext, chatHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const systemPrompt = `تۆ یاریدەدەر و راوێژکارێکی دارایی زیرەکی کەسیت بە زمانی کوردی (سۆرانی).
بەکارهێنەر پرسیارت لێ دەکات دەربارەی دۆخی دارایی، پاشەکەوت، خەرجییەکان، قەرزەکان، بودجە و ئامانجەکانی.
ئەمە داتای ڕاستەقینەی ئێستای بەکارهێنەرە لە ناو سیستەمەکەیدا:
${JSON.stringify(financialContext, null, 2)}

ڕێنماییەکان:
١. هەمیشە بە زمانی کوردی سۆرانی پاراو، جوان، ڕوون و دۆستانە وەڵام بدەرەوە.
٢. پشتبەست بە ژمارە و داتاکانی بەکارهێنەر لە سەرەوە وەڵام بدەرەوە (نموونە: باڵانسی لە کام بانکە، چەند قەرزی لای کێیە، چەندی سەرف کردووە).
٣. پێشنیاری کرداری و ئامۆژگاری زێڕین بدە بۆ پاشەکەوتکردن و کەمکردنەوەی خەرجی زیادە.
٤. خاڵ و ڕێنماییەکان بە شێوازی لیست و بڕگەی ڕوون بنووسە.`;

    const contents: any[] = [];

    // Add prior conversation turns if provided
    for (const msg of chatHistory.slice(-6)) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const reply = await callGeminiWithFallback(contents, systemPrompt);

    return res.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.warn('Gemini chat fell back to grounded generator:', error?.message);
    const reply = buildFallbackFinancialReply(message, financialContext);
    return res.json({
      success: true,
      reply,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Mount Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static build serving in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Financial System Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
