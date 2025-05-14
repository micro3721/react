// src/components/ResultCard.tsx
import React from 'react';

interface ResultCardProps {
    title: string;
    children: React.ReactNode;
}

const ResultCard: React.FC<ResultCardProps> = ({title, children}) => {
    return (
        <div className="resultCard"> {/* <--- 确保这里有 resultCard class */}
            <h3>{title}</h3>
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default ResultCard;