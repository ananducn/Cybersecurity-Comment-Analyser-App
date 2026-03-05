import Fuse from "fuse.js";

export const HARMFUL_WORDS: Record<string, number> = {
    // Severe (score: 90-100)
    "kill yourself": 100,
    "kys": 95,
    "go die": 90,
    "kill urself": 95,

    // High Severity (score: 70-89)
    "idiot": 70,
    "stupid": 65,
    "moron": 75,
    "loser": 72,
    "worthless": 80,
    "pathetic": 78,
    "disgusting": 72,
    "ugly": 65,
    "fat": 60,
    "hate you": 85,
    "nobody likes you": 88,
    "freak": 70,

    // Medium (score: 40-69)
    "dumb": 45,
    "shut up": 50,
    "lame": 40,
    "cringe": 42,
    "weirdo": 55,
    "creep": 60,
    "annoying": 45,
    "boring": 38,

    // Low (score: 10-39)
    "nerd": 20,
    "geek": 15,
    "dummy": 30,
    "baby": 25,
};

export type Severity = "safe" | "low" | "medium" | "high" | "severe";

export interface DetectionResult {
    score: number;
    severity: Severity;
    matchedWords: string[];
    highlightedText: string;
}

const fuseOptions = {
    includeScore: true,
    threshold: 0.3,
    distance: 50,
    minMatchCharLength: 3,
};

function getSeverity(score: number): Severity {
    if (score === 0) return "safe";
    if (score < 30) return "low";
    if (score < 55) return "medium";
    if (score < 75) return "high";
    return "severe";
}

/**
 * Analyze a piece of text for cyberbullying.
 * @param text       - the raw comment text
 * @param extraWords - optional {word: score} map from the DB custom keyword list;
 *                     these are merged on top of HARMFUL_WORDS (custom wins on conflict)
 */
export function analyzeText(
    text: string,
    extraWords: Record<string, number> = {}
): DetectionResult {
    const allWords: Record<string, number> = { ...HARMFUL_WORDS, ...extraWords };

    const lowerText = text.toLowerCase();
    const wordList = Object.keys(allWords);
    const fuse = new Fuse(wordList, fuseOptions);

    let maxScore = 0;
    const matchedWords: string[] = [];
    const positions: Array<{ start: number; end: number; word: string }> = [];

    // Exact keyword / phrase matching
    for (const [phrase, score] of Object.entries(allWords)) {
        const idx = lowerText.indexOf(phrase);
        if (idx !== -1) {
            if (!matchedWords.includes(phrase)) matchedWords.push(phrase);
            maxScore = Math.max(maxScore, score);
            positions.push({ start: idx, end: idx + phrase.length, word: phrase });
        }
    }

    // Fuzzy matching on individual tokens
    const tokens = lowerText.split(/\s+/);
    for (const token of tokens) {
        if (token.length < 3) continue;
        const results = fuse.search(token);
        for (const result of results) {
            if (result.score !== undefined && result.score < 0.25) {
                const matched = result.item;
                if (!matchedWords.includes(matched)) matchedWords.push(matched);
                const fuzzyScore = Math.round(allWords[matched] * (1 - result.score));
                maxScore = Math.max(maxScore, fuzzyScore);

                const tokenIdx = lowerText.indexOf(token);
                if (tokenIdx !== -1) {
                    positions.push({ start: tokenIdx, end: tokenIdx + token.length, word: matched });
                }
            }
        }
    }

    // Build highlighted HTML (process in reverse to preserve indices)
    let highlightedText = text;
    if (positions.length > 0) {
        const sorted = positions.sort((a, b) => b.start - a.start);
        for (const pos of sorted) {
            const wordScore = allWords[pos.word] ?? maxScore;
            highlightedText =
                highlightedText.slice(0, pos.start) +
                `<mark data-severity="${getSeverity(wordScore)}">${highlightedText.slice(pos.start, pos.end)}</mark>` +
                highlightedText.slice(pos.end);
        }
    }

    return {
        score: Math.min(maxScore, 100),
        severity: getSeverity(maxScore),
        matchedWords,
        highlightedText,
    };
}
