// pages/api/generate-product.js

/**
 * STORES API + Claude API 統合エンドポイント
 * 
 * POST /api/generate-product
 * 
 * Request Body:
 * {
 *   "productData": {
 *     "productName": "商品名",
 *     "basicDescription": "説明",
 *     "basePrice": "価格",
 *     "date": "開催日時",
 *     "location": "場所",
 *     "targetAudience": "ターゲット",
 *     "keyFeatures": "特徴"
 *   }
 * }
 */

export default async function handler(req, res) {
  // CORS 対応
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // API キー取得
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  const storesApiKey = process.env.STORES_API_KEY;

  if (!claudeApiKey || !storesApiKey) {
    console.error('Missing API keys');
    return res.status(500).json({
      error: 'API keys not configured on server',
      details: 'CLAUDE_API_KEY or STORES_API_KEY is missing'
    });
  }

  const { productData } = req.body;

  if (!productData) {
    return res.status(400).json({ error: 'productData is required' });
  }

  try {
    console.log('🔄 Step 1: Generating product content with Claude...');

    // ステップ1: Claude で商品説明を生成
    const claudePrompt = `
以下の撮影会情報をもとに、STORES.jp用の商品ページ用テキストを日本語で生成してください。

【商品情報】
商品名: ${productData.productName}
説明: ${productData.basicDescription}
基本価格: ¥${productData.basePrice}
開催日時: ${productData.date}
場所: ${productData.location}
ターゲット: ${productData.targetAudience}
${productData.keyFeatures ? `特徴:\n${productData.keyFeatures}` : ''}

以下の形式で返してください。各セクションは「---」で区切ってください：

【タイトル】
SEO対応で、クリックしたくなる商品タイトル（50字程度）

【説明】
商品の魅力を伝える説明文（150字程度）
※箇条書きやHTMLタグは使わず、自然な文体で

【特徴】
・特徴1（30字程度）
・特徴2（30字程度）
・特徴3（30字程度）

【キャンセルポリシー】
キャンセル・変更についての説明（100字程度）

【タグ】
SEO対応のタグを5～8個、カンマ区切りで（例：赤ちゃん撮影,ニューボーンフォト,...）

出力フォーマット：
TITLE: [タイトル]
---
DESCRIPTION: [説明]
---
FEATURES: [特徴]
---
CANCELLATION: [キャンセルポリシー]
---
TAGS: [タグ]
    `;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: claudePrompt
          }
        ],
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json();
      console.error('Claude API error:', errorData);
      throw new Error(`Claude API error: ${claudeResponse.status} ${JSON.stringify(errorData)}`);
    }

    const claudeData = await claudeResponse.json();
    const generatedContent = claudeData.content[0].text;

    console.log('✅ Claude generation completed');
    console.log('Generated content preview:', generatedContent.substring(0, 200) + '...');

    // ステップ2: 生成されたテキストをパース
    console.log('🔄 Step 2: Parsing generated content...');
    
    const sections = generatedContent.split('---').map(s => s.trim());
    const parsedData = {
      title: '',
      description: '',
      features: '',
      cancellation: '',
      tags: ''
    };

    sections.forEach(section => {
      const [key, ...valueParts] = section.split(':');
      const value = valueParts.join(':').trim();
      
      if (key.includes('TITLE')) parsedData.title = value.substring(0, 100);
      else if (key.includes('DESCRIPTION')) parsedData.description = value.substring(0, 500);
      else if (key.includes('FEATURES')) parsedData.features = value.substring(0, 500);
      else if (key.includes('CANCELLATION')) parsedData.cancellation = value.substring(0, 300);
      else if (key.includes('TAGS')) parsedData.tags = value;
    });

    if (!parsedData.title) {
      throw new Error('Failed to parse title from Claude response');
    }

    console.log('✅ Content parsed successfully');

    // ステップ3: STORES API に商品を登録
    console.log('🔄 Step 3: Creating item on STORES...');

    const storesResponse = await fetch('https://api.stores.dev/retail/202211/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${storesApiKey}`,
      },
      body: JSON.stringify({
        name: parsedData.title,
        description: parsedData.description,
        price: parseInt(productData.basePrice, 10),
        status: 'shown',
      })
    });

    if (!storesResponse.ok) {
      const errorData = await storesResponse.json();
      console.error('STORES API error:', errorData);
      throw new Error(`STORES API error: ${storesResponse.status} ${JSON.stringify(errorData)}`);
    }

    const storesData = await storesResponse.json();

    console.log('✅ Item created on STORES');
    console.log('Item ID:', storesData.id);

    // 成功レスポンス
    return res.status(200).json({
      success: true,
      message: 'Product created successfully',
      generatedContent: parsedData,
      storesItemId: storesData.id,
      storesItem: storesData,
      metadata: {
        timestamp: new Date().toISOString(),
        productName: productData.productName,
        basePrice: productData.basePrice,
      }
    });

  } catch (error) {
    console.error('Error in generate-product:', error);
    
    const errorMessage = error.message || 'Internal server error';
    const statusCode = error.message?.includes('API error') ? 400 : 500;

    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
