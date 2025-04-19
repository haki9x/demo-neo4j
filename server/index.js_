const express = require('express');
const path = require('path');
const compression = require('compression');
const neo4j = require('neo4j-driver');
const cors = require('cors');

const buildDir = path.join(__dirname, '../build');
// console.log('Using files in ' + buildDir);
const subDir = '/';
const logRequests = false;
const app = express();
app.use(express.json());
// app.use(compression());
app.use(cors()); // Cho phép tất cả các nguồn
if (subDir === '/') {
    // console.log('The server config assuming it is serving at the server root. You can control this with the `subDir` variable in index.js.');
} else {
    // console.log('The server config assuming it is serving at \'' + subDir + '\'.');
}
if (logRequests) {
    // console.log('The server will log all incoming request. It\'s not recommended for production use.');
}

// Serve the static files from the React app
// app.use(subDir, express.static(buildDir));

app.use('/', function (req, res, next) {
    express.static(buildDir)(req, res, next);
})

app.get('*', (req, res) => {
    return res.sendFile(path.join(buildDir, 'index.html'));
});

const driver = neo4j.driver(
    'neo4j+s://334c407f.databases.neo4j.io',
    neo4j.auth.basic('neo4j', 'vjVQA6EcnFhMfFIPZpxofizN6OYW6EyD-tdEOGxP19I')
);

app.post('/api/company', async (req, res) => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (c:Company) 
            WHERE c.source_file IS NOT NULL 
            RETURN c.name AS p, c.source_file AS s`);
        let data = [];
        result.records.forEach(record => {
            const FullName = record.get('p'); // Lấy object dạng Path
            let s = record.get('s'); // Lấy object dạng Path
            s = s.split("_")[0] || undefined
            if (FullName && s) {
                data.push({ symbol: s, FullName: FullName })
            }
            if (FullName == "Công ty TNHH MTV Cơ khí chính xác và chế tạo khuôn mẫu Việt Nam"){
                console.log("find.:", s)
            }
        });
        data = Array.from(
            new Map(data.map(item => [item.symbol, item])).values()
        );
        // console.log("data.:", data)
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Query failed' });
    } finally {
        await session.close();
    }
});


app.post('/api/query', async (req, res) => {
    const { query } = req.body;
    const session = driver.session();
    // console.log("query.:1", query)
    try {
        const result = await session.run(query);
        const nodesMap = new Map();
        const edges = [];
        // console.log("query.:2", result.records)
        result.records.forEach(record => {
            const path = record.get('p'); // Lấy object dạng Path
            path.segments.forEach(segment => {
                const start = segment.start;
                const end = segment.end;
                const rel = segment.relationship;

                // Add start node
                if (!nodesMap.has(start.identity.toString())) {
                    nodesMap.set(start.identity.toString(), {
                        id: start.identity.toString(),
                        label: start.labels[0],
                        ...start.properties
                    });
                }

                // Add end node
                if (!nodesMap.has(end.identity.toString())) {
                    nodesMap.set(end.identity.toString(), {
                        id: end.identity.toString(),
                        label: end.labels[0],
                        ...end.properties
                    });
                }

                // Add relationship (edge)
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Query failed' });
    } finally {
        await session.close();
    }
});

// Haki.: Ghi log Fs2pro [Start]


const port = process.env.PORT || 3008;
app.listen(port);

console.log('Neo4j App Server is listening on port ' + port);