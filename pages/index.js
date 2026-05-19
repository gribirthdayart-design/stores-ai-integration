// pages/index.js
import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [vercelUrl, setVercelUrl] = useState('https://your-vercel-url.vercel.app');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('form');

  const [productData, setProductData] = useState({
    productName: 'Milk Bath photo session',
    basicDescription: '赤ちゃんをミルク色のお風呂に入れた、おしゃれで温かみのある撮影会。花や小物とのコーディネートで、SNS映えする写真が撮れます。',
    basePrice: '15000',
    date: '2026年6月11日（木）10時～15時半',
    location: 'studio ringo / 大阪市西区',
    targetAudience: '生後3ヶ月～1歳半の赤ちゃんと保護者',
    keyFeatures: '温かみのある花のセッティング\nSNS映えする高品質な写真\nベビーセーフなお風呂撮影',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!vercelUrl || vercelUrl === 'https://your-vercel-url.vercel.app') {
      setError('⚠️ Vercel URLを設定してください');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${vercelUrl}/api/generate-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productData })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      setResult(data);
      setActiveTab('result');
    } catch (err) {
      setError(`❌ エラー: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>🚀 STORES × Claude AI</h1>
        <p>商品を自動生成してストアーズに登録</p>
      </header>

      <div style={styles.configSection}>
        <label style={styles.label}>Vercel デプロイ URL</label>
        <input
          type="text"
          value={vercelUrl}
          onChange={(e) => setVercelUrl(e.target.value)}
          placeholder="https://your-app.vercel.app"
          style={styles.input}
        />
        <small style={{ color: '#718096', marginTop: '0.5rem', display: 'block' }}>
          💡 Vercel ダッシュボードから確認できます
        </small>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('form')}
          style={{
            ...styles.tabButton,
            borderBottomColor: activeTab === 'form' ? '#667eea' : 'transparent',
          }}
        >
          📝 商品情報
        </button>
        <button
          onClick={() => setActiveTab('result')}
          style={{
            ...styles.tabButton,
            borderBottomColor: activeTab === 'result' ? '#667eea' : 'transparent',
          }}
        >
          ✅ 結果
        </button>
      </div>

      {activeTab === 'form' && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.section}>
            <h2>📸 基本情報</h2>

            <div style={styles.formGroup}>
              <label style={styles.label}>商品名</label>
              <input
                type="text"
                name="productName"
                value={productData.productName}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>商品説明</label>
              <textarea
                name="basicDescription"
                value={productData.basicDescription}
                onChange={handleChange}
                style={{ ...styles.input, minHeight: '100px' }}
                required
              />
            </div>
          </div>

          <div style={styles.section}>
            <h2>💰 価格・詳細</h2>

            <div style={styles.grid2}>
              <div style={styles.formGroup}>
                <label style={styles.label}>基本価格（税込み）</label>
                <input
                  type="number"
                  name="basePrice"
                  value={productData.basePrice}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>開催日時</label>
                <input
                  type="text"
                  name="date"
                  value={productData.date}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>場所</label>
              <input
                type="text"
                name="location"
                value={productData.location}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>ターゲット層</label>
              <input
                type="text"
                name="targetAudience"
                value={productData.targetAudience}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>主な特徴（改行で区切る）</label>
              <textarea
                name="keyFeatures"
                value={productData.keyFeatures}
                onChange={handleChange}
                style={{ ...styles.input, minHeight: '80px', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          {error && (
            <div style={styles.alert}>
              {error}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  生成中...
                </>
              ) : (
                '✨ AI で生成・登録'
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'result' && result && (
        <div style={styles.resultSection}>
          <div style={styles.successBadge}>✅ ストアーズに登録されました！</div>

          <div style={styles.resultCard}>
            <h3>📝 生成されたタイトル</h3>
            <div style={styles.resultBox}>{result.generatedContent.title}</div>
          </div>

          <div style={styles.resultCard}>
            <h3>📄 商品説明</h3>
            <div style={styles.resultBox}>{result.generatedContent.description}</div>
          </div>

          <div style={styles.resultCard}>
            <h3>⭐ 特徴</h3>
            <div style={styles.resultBox}>{result.generatedContent.features}</div>
          </div>

          <div style={styles.resultCard}>
            <h3>❌ キャンセルポリシー</h3>
            <div style={styles.resultBox}>{result.generatedContent.cancellation}</div>
          </div>

          <div style={styles.resultCard}>
            <h3>🏷️ SEO タグ</h3>
            <div style={styles.resultBox}>{result.generatedContent.tags}</div>
          </div>

          <div style={styles.infoBox}>
            <strong>STORES Item ID:</strong>
            <code style={{ display: 'block', marginTop: '0.5rem' }}>{result.storesItemId}</code>
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={() => setActiveTab('form')}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              ← 別の商品を生成
            </button>
            <a
              href={`https://stores.jp/admin/items/${result.storesItemId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...styles.button, ...styles.buttonPrimary, textDecoration: 'none', textAlign: 'center' }}
            >
              STORES で編集 →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '1.5rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1a202c',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '12px',
    padding: '2.5rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  configSection: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  tabs: {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '2rem',
  },
  tabButton: {
    padding: '1rem 1.5rem',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#718096',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease',
  },
  form: {
    background: 'white',
  },
  section: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '0.5rem',
    color: '#1a202c',
  },
  input: {
    width: '100%',
    fontSize: '14px',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    padding: '0.75rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '1.5rem',
  },
  button: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    fontSize: '14px',
    fontWeight: 500,
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonPrimary: {
    background: '#667eea',
    color: 'white',
    border: '1px solid #667eea',
  },
  buttonSecondary: {
    background: 'white',
    color: '#667eea',
    border: '1px solid #667eea',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid #ffffff',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    marginRight: '0.5rem',
  },
  alert: {
    background: '#fed7d7',
    border: '1px solid #f5b6a4',
    color: '#742a2a',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '13px',
  },
  resultSection: {
    background: 'white',
  },
  successBadge: {
    display: 'inline-block',
    background: '#c6f6d5',
    color: '#22543d',
    fontSize: '12px',
    padding: '4px 12px',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  resultCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  resultBox: {
    background: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '1rem',
    fontSize: '13px',
    lineHeight: '1.6',
    fontFamily: 'monospace',
    maxHeight: '300px',
    overflowY: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  infoBox: {
    background: '#edf2f7',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1rem',
    fontSize: '13px',
  },
};
