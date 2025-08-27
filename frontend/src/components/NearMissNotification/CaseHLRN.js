import { useState, useEffect, useLayoutEffect } from 'react';
import styles from './postIt.module.css';

const TypingText = ({ text, onComplete, highlightText, highlightStyle, highlightTexts }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 80);

            return () => clearTimeout(timer);
        } else {
            setIsTyping(false);
            if (onComplete) {
                setTimeout(onComplete, 500);
            }
        }
    }, [currentIndex, text, onComplete]);

    // 타이핑 중에도 강조 효과를 적용하는 함수
    const renderTextWithHighlights = (text, currentLength) => {
        let result = '';
        let tempIndex = 0;

        if (highlightTexts) {
            // 여러 강조 텍스트가 있는 경우
            for (const highlight of highlightTexts) {
                const highlightIndex = text.indexOf(highlight.text, tempIndex);
                if (highlightIndex !== -1) {
                    // 강조 텍스트 이전의 일반 텍스트
                    if (highlightIndex > tempIndex) {
                        const normalText = text.slice(tempIndex, highlightIndex);
                        const normalLength = Math.min(normalText.length, currentLength - tempIndex);
                        if (normalLength > 0) {
                            result += `<span style="color: #ffffff; font-size: 2.4rem;">${normalText.slice(0, normalLength)}</span>`;
                        }
                        tempIndex += normalLength;
                    }

                    // 강조 텍스트
                    if (tempIndex < currentLength) {
                        const highlightLength = Math.min(highlight.text.length, currentLength - tempIndex);
                        if (highlightLength > 0) {
                            const styleString = Object.entries(highlight.style)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join('; ');
                            result += `<span style="${styleString}">${highlight.text.slice(0, highlightLength)}</span>`;
                        }
                        tempIndex += highlightLength;
                    }
                }
            }

            // 마지막 강조 텍스트 이후의 일반 텍스트
            if (tempIndex < currentLength) {
                const remainingText = text.slice(tempIndex, currentLength);
                result += `<span style="color: #ffffff; font-size: 2.4rem;">${remainingText}</span>`;
            }
        } else if (highlightText) {
            // 단일 강조 텍스트가 있는 경우
            const highlightIndex = text.indexOf(highlightText);
            if (highlightIndex !== -1) {
                // 강조 텍스트 이전의 일반 텍스트
                if (highlightIndex > 0) {
                    const normalText = text.slice(0, highlightIndex);
                    const normalLength = Math.min(normalText.length, currentLength);
                    if (normalLength > 0) {
                        result += `<span style="color: #ffffff; font-size: 2.4rem;">${normalText.slice(0, normalLength)}</span>`;
                    }
                    tempIndex += normalLength;
                }

                // 강조 텍스트
                if (tempIndex < currentLength) {
                    const highlightLength = Math.min(highlightText.length, currentLength - tempIndex);
                    if (highlightLength > 0) {
                        const styleString = Object.entries(highlightStyle)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join('; ');
                        result += `<span style="${styleString}">${highlightText.slice(0, highlightLength)}</span>`;
                    }
                    tempIndex += highlightLength;
                }

                // 강조 텍스트 이후의 일반 텍스트
                if (tempIndex < currentLength) {
                    const remainingText = text.slice(tempIndex, currentLength);
                    result += `<span style="color: #ffffff; font-size: 2.4rem;">${remainingText}</span>`;
                }
            } else {
                // 강조 텍스트가 없는 경우
                result = `<span style="color: #ffffff; font-size: 2.4rem;">${text.slice(0, currentLength)}</span>`;
            }
        } else {
            // 강조 텍스트가 없는 경우
            result = `<span style="color: #ffffff; font-size: 2.4rem;">${text.slice(0, currentLength)}</span>`;
        }

        return result;
    };

    return (
        <div className={styles.typingLine}>
            <span dangerouslySetInnerHTML={{ __html: renderTextWithHighlights(text, currentIndex) }} />
            {isTyping && <span className={styles.cursor}>|</span>}
        </div>
    );
};

const CaseHLRN = () => {
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [lineHeights, setLineHeights] = useState({});

    const messages = [
        "On average, a levee height of 12 feet is needed to manage flood risk in our region.",
        "On one occasion, experts warned of a major storm that could raise the river unusually high and well above normal levels, posing a threat to areas near the river.",
        "At the time, our village had a 16-foot levee in place. However, the storm weakened by chance, and the river near us rose to 15 feet. As a result, our village remained undamaged and experienced 0% flood loss."
    ];

    const handleLineComplete = () => {
        setCurrentLineIndex(prev => prev + 1);
    };

    const calculateLinePosition = (index) => {
        if (index === 0) return 150;
        
        let totalHeight = 150;
        for (let i = 0; i < index; i++) {
            const lineHeight = lineHeights[i] || 120;
            totalHeight += lineHeight + 20;
        }
        return totalHeight;
    };

    const handleLineHeightUpdate = (index, height) => {
        setLineHeights(prev => ({
            ...prev,
            [index]: height
        }));
    };

    // useLayoutEffect를 사용하여 높이 변경을 즉시 반영
    useLayoutEffect(() => {
        // 모든 완성된 라인의 높이를 다시 계산
        const recalculateHeights = () => {
            const newHeights = {};
            for (let i = 0; i < currentLineIndex; i++) {
                const element = document.querySelector(`[data-line-index="${i}"]`);
                if (element) {
                    const height = element.scrollHeight;
                    newHeights[i] = height;
                }
            }
            setLineHeights(newHeights);
        };

        if (currentLineIndex > 0) {
            recalculateHeights();
        }

        // 인라인 스타일 강제 적용
        const enforceInlineStyles = () => {
            // 첫 번째 안내 문구
            const firstGuide = document.querySelector('[data-guide="first"]');
            if (firstGuide) {
                firstGuide.style.setProperty('font-size', '1.8rem', 'important');
            }

            // 두 번째 안내 문구
            const secondGuide = document.querySelector('[data-guide="second"]');
            if (secondGuide) {
                secondGuide.style.setProperty('font-size', '1.6rem', 'important');
            }
        };

        // DOM이 렌더링된 후 스타일 강제 적용
        setTimeout(enforceInlineStyles, 0);
    }, [currentLineIndex]);

    // 강조 스타일 정의
    const highlightNumber = {
        color: '#00ffff',
        fontWeight: '900',
        letterSpacing: '0px',
        lineHeight: '1.3'
    };

    const highlightResult = {
        color: '#ffff00',
        fontWeight: '900',
        letterSpacing: '0px',
        lineHeight: '1.3'
    };

    // 밑줄이 있는 강조 스타일 정의
    const highlightResultWithUnderline = {
        color: '#ffff00',
        fontWeight: '900',
        letterSpacing: '0px',
        lineHeight: '1.3',
        textDecoration: 'underline'
    };

    // 일반 텍스트 스타일 정의
    const normalText = {
        color: '#ffffff',
        lineHeight: '1.3',
        letterSpacing: '0px'
    };

    return (
        <div className={styles.starwarsContainer}>
            <div className={`${styles.text} ${styles.typingContainer}`}>
                {/* 안내 문구 */}
                <div 
                    data-guide="first"
                    style={{
                        position: 'fixed',
                        top: '50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        textAlign: 'center',
                        color: '#ffffff',
                        fontWeight: '600',
                        opacity: '0.8',
                        zIndex: 10,
                        pointerEvents: 'none',
                        textShadow: '0 0 5px rgba(255, 255, 255, 0.5)'
                    }}>
                    Below is a brief scenario describing a past event related to the upcoming exercise.
                </div>
                
                <div 
                    data-guide="second"
                    style={{
                        position: 'fixed',
                        top: '90px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        textAlign: 'center',
                        color: '#ffffff',
                        fontWeight: '400',
                        opacity: '0.7',
                        zIndex: 10,
                        pointerEvents: 'none',
                        textShadow: '0 0 5px rgba(255, 255, 255, 0.5)',
                        fontStyle: 'italic'
                    }}>
                    Please read it carefully—It may be relevant to the decisions you will make.
                </div>
                
                {messages.map((message, index) => (
                    <div key={index} 
                         data-line-index={index}
                         style={{
                        position: 'fixed',
                        top: `${calculateLinePosition(index)}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '100%',
                        display: 'block',
                        color: '#ffd700',
                        fontWeight: '600',
                        textAlign: 'left',
                        textShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                        zIndex: 10,
                        pointerEvents: 'none',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                        lineHeight: '1.3',
                        padding: '0 20px'
                    }}
                    ref={(el) => {
                        if (el && index < currentLineIndex) {
                            const height = el.scrollHeight;
                            if (lineHeights[index] !== height) {
                                handleLineHeightUpdate(index, height);
                            }
                        }
                    }}>
                        {index < currentLineIndex ? (
                            // Completed line with highlights
                            <>
                                {index === 0 && (
                                    <>
                                        <span style={normalText}>On average, a levee height of </span><span style={highlightNumber}>12 feet</span><span style={normalText}> is needed to manage flood risk in our region.</span>
                                    </>
                                )}
                                {index === 1 && (
                                    <span style={normalText}>On one occasion, experts warned of a major storm that could raise the river unusually high and well above normal levels, posing a threat to areas near the river.</span>
                                )}
                                {index === 2 && (
                                    <>
                                        <span style={normalText}>At the time, our village had a </span><span style={highlightNumber}>16-foot</span><span style={normalText}> levee in place. However, the storm weakened by chance, and the river near us rose to </span><span style={highlightNumber}>15 feet</span><span style={normalText}>. As a result, </span><span style={highlightResultWithUnderline}>our village</span><span style={highlightResult}> remained undamaged</span><span style={normalText}> and experienced </span><span style={highlightResult}>0% flood loss</span><span style={normalText}>.</span>
                                    </>
                                )}
                            </>
                        ) : index === currentLineIndex ? (
                            // Currently typing line with highlights
                            <div
                                ref={(el) => {
                                    if (el) {
                                        const height = el.scrollHeight;
                                        if (lineHeights[index] !== height) {
                                            handleLineHeightUpdate(index, height);
                                        }
                                    }
                                }}
                            >
                                {index === 0 && (
                                    <TypingText 
                                        text="On average, a levee height of 12 feet is needed to manage flood risk in our region." 
                                        onComplete={handleLineComplete}
                                        highlightText="12 feet"
                                        highlightStyle={highlightNumber}
                                    />
                                )}
                                {index === 1 && (
                                    <TypingText 
                                        text="On one occasion, experts warned of a major storm that could raise the river unusually high and well above normal levels, posing a threat to areas near the river." 
                                        onComplete={handleLineComplete}
                                    />
                                )}
                                {index === 2 && (
                                    <TypingText 
                                        text="At the time, our village had a 16-foot levee in place. However, the storm weakened by chance, and the river near us rose to 15 feet. As a result, our village remained undamaged and experienced 0% flood loss." 
                                        onComplete={handleLineComplete}
                                        highlightTexts={[
                                            { text: "16-foot", style: highlightNumber },
                                            { text: "15 feet", style: highlightNumber },
                                            { text: "our village remained undamaged", style: highlightResultWithUnderline },
                                            { text: "0% flood loss", style: highlightResultWithUnderline }
                                        ]}
                                    />
                                )}
                            </div>
                        ) : (
                            // Future line (invisible but takes up space)
                            <div style={{ opacity: 0 }}>{message}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CaseHLRN;
