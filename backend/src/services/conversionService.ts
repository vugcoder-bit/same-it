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
    // The client's Java code strictly masks the UTF-16 char to its lower byte to derive ASCII.
    if (mode === 'toHex') {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const lowerByte = charCode & 0xFF; // Exactly matches the substring(1,3) truncation logic in Java
            result += String.fromCharCode(lowerByte);
        }
        return { converted: result };
    } else {
        // Reverse logical operation for toText (If they input "E1-('", we shift logic)
        // Since the truncation loses Information (e.g. discards 0x06), we assume the original characters were Arabic (0x06XX block)
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            // Reconstruct the Arabic char by prepending the 0x06 high byte
            const arabicCode = 0x0600 | (charCode & 0xFF);
            result += String.fromCharCode(arabicCode);
        }
        return { converted: result };
    }
};
