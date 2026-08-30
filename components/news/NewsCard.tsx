"use client";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image: string;
  source: string;
  publishedAt: string;
  category: string;
  url: string;
}

interface NewsCardProps {
  news: NewsItem;
}

export default function NewsCard({ news }: NewsCardProps) {
  return (
    <article className="news-card">
      <img src={news.image} alt={news.title} />

      <div className="content">
        <span className="category">{news.category}</span>

        <h2>{news.title}</h2>

        <p>{news.summary}</p>

        <div className="footer">
          <span>{news.source}</span>
          <span>{news.publishedAt}</span>
        </div>

        <a
          href={news.url}
          target="_blank"
          rel="noopener noreferrer"
          className="read-more"
        >
          Read More →
        </a>
      </div>

      <style jsx>{`
        .news-card {
          background: #161b22;
          border: 1px solid #2d3748;
          border-radius: 14px;
          overflow: hidden;
          transition: .25s;
        }

        .news-card:hover {
          transform: translateY(-4px);
          border-color: #2563eb;
        }

        img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }

        .content {
          padding: 20px;
        }

        .category {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          margin-bottom: 12px;
        }

        h2 {
          color: white;
          margin: 0 0 12px;
          font-size: 22px;
          line-height: 1.4;
        }

        p {
          color: #94a3b8;
          line-height: 1.7;
          margin-bottom: 18px;
        }

        .footer {
          display: flex;
          justify-content: space-between;
          color: #64748b;
          font-size: 13px;
          margin-bottom: 18px;
        }

        .read-more {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
        }

        .read-more:hover {
          color: white;
        }
      `}</style>
    </article>
  );
}