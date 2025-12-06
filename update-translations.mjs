import { readFileSync, writeFileSync } from 'fs';

const filePath = 'd:/个人创新AI产品/PhotoAITalk/PhotoAITalk-1/constants/translations.ts';
let content = readFileSync(filePath, 'utf8');

// Define the new translations for each language
const updates = {
    English: {
        nativeExpressions: "Native Expressions",
        hideExpressions: "Hide Expressions",
        styleSimple: "Simple",
        styleAdvanced: "Advanced",
        stylePoetic: "Poetic"
    },
    Chinese: {
        nativeExpressions: "地道表达",
        hideExpressions: "收起表达",
        styleSimple: "简单",
        styleAdvanced: "进阶",
        stylePoetic: "文艺"
    },
    Spanish: {
        nativeExpressions: "Expresiones Nativas",
        hideExpressions: "Ocultar Expresiones",
        styleSimple: "Simple",
        styleAdvanced: "Avanzado",
        stylePoetic: "Poético"
    },
    French: {
        nativeExpressions: "Expressions Natives",
        hideExpressions: "Masquer Expressions",
        styleSimple: "Simple",
        styleAdvanced: "Avancé",
        stylePoetic: "Poétique"
    },
    Japanese: {
        nativeExpressions: "ネイティブ表現",
        hideExpressions: "表現を隠す",
        styleSimple: "簡単",
        styleAdvanced: "上級",
        stylePoetic: "詩的"
    },
    Korean: {
        nativeExpressions: "원어민 표현",
        hideExpressions: "표현 숨기기",
        styleSimple: "간단",
        styleAdvanced: "고급",
        stylePoetic: "문학적"
    },
    German: {
        nativeExpressions: "Muttersprachliche Ausdrücke",
        hideExpressions: "Ausdrücke ausblenden",
        styleSimple: "Einfach",
        styleAdvanced: "Fortgeschritten",
        stylePoetic: "Poetisch"
    },
    Italian: {
        nativeExpressions: "Espressioni Native",
        hideExpressions: "Nascondi Espressioni",
        styleSimple: "Semplice",
        styleAdvanced: "Avanzato",
        stylePoetic: "Poetico"
    },
    Russian: {
        nativeExpressions: "Родные выражения",
        hideExpressions: "Скрыть выражения",
        styleSimple: "Простой",
        styleAdvanced: "Продвинутый",
        stylePoetic: "Поэтичный"
    },
    Portuguese: {
        nativeExpressions: "Expressões Nativas",
        hideExpressions: "Ocultar Expressões",
        styleSimple: "Simples",
        styleAdvanced: "Avançado",
        stylePoetic: "Poético"
    }
};

// Remove old keys and add new ones
// Old keys: showInsights, hideInsights
// New keys: nativeExpressions, hideExpressions, styleSimple, styleAdvanced, stylePoetic

for (const [lang, texts] of Object.entries(updates)) {
    // Regex to find the language block
    const langRegex = new RegExp(`${lang}: \\{[\\s\\S]*?\\},`, 'g');
    const match = content.match(langRegex);

    if (match) {
        let block = match[0];

        // Remove old keys if they exist
        block = block.replace(/[\s]*showInsights: "[^"]*",/g, '');
        block = block.replace(/[\s]*hideInsights: "[^"]*",/g, '');

        // Add new keys before the closing brace
        const newKeys = `
        nativeExpressions: "${texts.nativeExpressions}",
        hideExpressions: "${texts.hideExpressions}",
        styleSimple: "${texts.styleSimple}",
        styleAdvanced: "${texts.styleAdvanced}",
        stylePoetic: "${texts.stylePoetic}",`;

        block = block.replace(/\s*\},/, `${newKeys}\n    },`);

        content = content.replace(match[0], block);
        console.log(`Updated ${lang}`);
    }
}

writeFileSync(filePath, content, 'utf8');
console.log('Translations updated successfully');
