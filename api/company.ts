import { VercelRequest, VercelResponse } from '@vercel/node';
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
    'neo4j+s://334c407f.databases.neo4j.io',
    neo4j.auth.basic('neo4j', 'vjVQA6EcnFhMfFIPZpxofizN6OYW6EyD-tdEOGxP19I')
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const session = driver.session();

    try {
        const result = await session.run(`
            MATCH (c:Company) 
            WHERE c.source_file IS NOT NULL 
            RETURN c.name AS p, c.source_file AS s
        `);

        const data: { symbol: string, FullName: string }[] = [];

        result.records.forEach(record => {
            const fullName = record.get('p') as string;
            let sourceFile = record.get('s') as string;
            const symbol = sourceFile?.split("_")[0] || undefined;

            if (fullName && symbol) {
                data.push({ symbol, FullName: fullName });
            }
        });

        const uniqueData = Array.from(new Map(data.map(item => [item.symbol, item])).values());
        res.json(uniqueData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Query failed' });
    } finally {
        await session.close();
    }
}
