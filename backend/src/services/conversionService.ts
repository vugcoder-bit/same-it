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
    if (mode === 'toHex') {
        // Convert each character to its hex representation (UTF-8 bytes)
        const buffer = Buffer.from(text, 'utf-8');
        const hexParts: string[] = [];
        for (const byte of buffer) {
            hexParts.push(byte.toString(16).toUpperCase().padStart(2, '0'));
        }
        return { converted: hexParts.join(' ') };
    } else {
        // Convert hex string back to UTF-8 text
        const cleanHex = text.replace(/\s+/g, '');
        if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
            throw new Error('INVALID_HEX');
        }
        if (cleanHex.length % 2 !== 0) {
            throw new Error('INVALID_HEX');
        }
        const bytes = Buffer.alloc(cleanHex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
        }
        return { converted: bytes.toString('utf-8') };
    }
};
