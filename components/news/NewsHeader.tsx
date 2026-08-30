"use client";

interface NewsHeaderProps {
  totalNews: number;
}

export default function NewsHeader({ totalNews }: NewsHeaderProps) {
  return (
    <div className="news-header">
      <div>
        <h1>Market News</h1>
        <p>Latest financial news covering Forex, Gold, Crypto, Stocks and Commodities.</p>
      </div>

      <div className="news-count">
        <span>{totalNews}</span>
        <small>Articles</small>
      </div>

      <style jsx>{`
        .news-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #2d3748;
        }

        h1 {
          margin: 0;
          color: #fff;
          font-size: 2rem;
          font-weight: 700;
        }

        p {
          margin-top: 8px;
          color: #94a3b8;
          font-size: 15px;
          line-height: 1.6;
        }

        .news-count {
          min-width: 120px;
          text-align: center;
          padding: 18px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        .news-count span {
          display: block;
          font-size: 32px;
          font-weight: 700;
          color: white;
        }

        .news-count small {
          color: rgba(255,255,255,.8);
        }

        @media (max-width:768px) {
          .news-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .news-count {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}