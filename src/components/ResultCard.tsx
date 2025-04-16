import React from 'react';
import styles from './ResultCard.module.css'; // Import the CSS Module

interface ResultCardProps {
    title: string;
    content: string | null;
}

const ResultCard: React.FC<ResultCardProps> = ({ title, content }) => {
    return (
        <div className={styles.card}> {/* Use the 'card' class from CSS Module */}
            <h3 className={styles.cardTitle}>{title}</h3> {/* Use the 'cardTitle' class */}
            <div className={styles.cardContent}> {/* Use the 'cardContent' class */}
                {content ? (
                    // Render plain text or potentially HTML from backend safely
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                    <p>No data received.</p>
                )}
            </div>
        </div>
    );
};

export default ResultCard;