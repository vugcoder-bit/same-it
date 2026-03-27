import prisma from '../utils/prisma';

interface ConversionRuleData {
    arabicLetter: string;
    symbol: string;
}

export const create = async (data: ConversionRuleData) => {
    return prisma.conversionRule.create({
        data: {
            arabicLetter: data.arabicLetter,
            symbol: data.symbol,
        },
    });
};

export const getAll = async () => {
    return prisma.conversionRule.findMany();
};

export const update = async (id: number, data: Partial<ConversionRuleData>) => {
    return prisma.conversionRule.update({ where: { id }, data });
};

export const remove = async (id: number) => {
    return prisma.conversionRule.delete({ where: { id } });
};

export const convertText = async (text: string, mode: 'toHex' | 'toText'): Promise<{ converted: string }> => {
    // Strip Arabic diacritics (Tashkeel) like Fathatan (ً) which invisibly add characters like 0x064B to the string
    const sanitizedText = text.replace(/[\u064B-\u065F\u0670]/g, '');

    if (mode === 'toHex') {
        let hexResult = "";
        for (let i = 0; i < sanitizedText.length; i++) {
            let code = sanitizedText.charCodeAt(i).toString(16).toUpperCase();
            if (code.length === 1) code = "0" + code;
            if (code.length === 3) code = code.substring(1, 3);
            hexResult += code + " ";
        }
        
        // Decode back to the corrupted ASCII format matching the client's output
        const hexText = hexResult.replace(/ /g, "");
        let result = "";
        for (let i = 0; i < hexText.length; i += 2) {
            result += String.fromCharCode(parseInt(hexText.substring(i, i + 2), 16));
        }
        return { converted: result };
    } else {
        // Assume input is the ASCII "E1-('" format. We decode it back to Hex, then pre-pend the Arabic 0x06 byte
        let hexResult = "";
        for (let i = 0; i < text.length; i++) {
            let code = text.charCodeAt(i).toString(16).toUpperCase();
            if (code.length === 1) code = "0" + code;
            hexResult += code;
        }
        
        let result = "";
        for (let i = 0; i < hexResult.length; i += 2) {
            // Reconstruct Arabic by combining 0x06 with the parsed hex code
            const arabicCode = 0x0600 | parseInt(hexResult.substring(i, i + 2), 16);
            result += String.fromCharCode(arabicCode);
        }
        return { converted: result };
    }
};
