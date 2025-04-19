// https://vercel.com/guides/using-express-with-vercel

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import neo4j, { Driver, Session } from 'neo4j-driver';

const buildDir = path.join(__dirname, '../build');
const subDir = '/';
const logRequests = false;

const app = express();
app.use(express.json());
app.use(cors());

if (logRequests) {
    app.use((req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// Static file serving
app.use('/', (req: Request, res: Response, next: NextFunction) => {
    express.static(buildDir)(req, res, next);
});

// React routing fallback
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(buildDir, 'index.html'));
});

// Neo4j setup
const driver: Driver = neo4j.driver(
    'neo4j+s://334c407f.databases.neo4j.io',
    neo4j.auth.basic('neo4j', 'vjVQA6EcnFhMfFIPZpxofizN6OYW6EyD-tdEOGxP19I')
);

// API: Get Company List
app.post('/company', async (req: Request, res: Response) => {
    const session: Session = driver.session();
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

            if (fullName === "Công ty TNHH MTV Cơ khí chính xác và chế tạo khuôn mẫu Việt Nam") {
                console.log("find.:", symbol);
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
});


// API: Query Graph Data
app.post('/query', async (req: Request, res: Response) => {
    const { query } = req.body;
    const session: Session = driver.session();

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
});


// API: Get Company List
app.post('/api/company', async (req: Request, res: Response) => {
    const session: Session = driver.session();
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

            if (fullName === "Công ty TNHH MTV Cơ khí chính xác và chế tạo khuôn mẫu Việt Nam") {
                console.log("find.:", symbol);
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
});

// API: Query Graph Data
app.post('/api/query', async (req: Request, res: Response) => {
    const { query } = req.body;
    const session: Session = driver.session();

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
});

// Start server
const port = process.env.PORT || 3008;
app.listen(port, () => {
    console.log(`Neo4j App Server is listening on port ${port}`);
});
