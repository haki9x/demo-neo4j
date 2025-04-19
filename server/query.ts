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

    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Missing query' });
    }

    const session = driver.session();

    try {
        const result = await session.run(query);
        const nodesMap = new Map<string, any>();
        const edges: { from: string; to: string; label: string }[] = [];

        result.records.forEach(record => {
            const pathObj = record.get('p');

            if (!pathObj?.segments) return;

            pathObj.segments.forEach((segment: any) => {
                const start = segment.start;
                const end = segment.end;
                const rel = segment.relationship;

                if (!nodesMap.has(start.identity.toString())) {
                    nodesMap.set(start.identity.toString(), {
                        id: start.identity.toString(),
                        label: start.labels[0],
                        ...start.properties
                    });
                }

                if (!nodesMap.has(end.identity.toString())) {
                    nodesMap.set(end.identity.toString(), {
                        id: end.identity.toString(),
                        label: end.labels[0],
                        ...end.properties
                    });
                }

                edges.push({
                    from: start.identity.toString(),
                    to: end.identity.toString(),
                    label: rel.type
                });
            });
        });

        res.json({
            nodes: Array.from(nodesMap.values()),
            edges
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Query failed' });
    } finally {
        await session.close();
    }
}
