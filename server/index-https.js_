const express = require('express');
const path = require('path');
const http2 = require('http2');
const http2Express = require('http2-express-bridge');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const neo4j = require('neo4j-driver');
const compression = require('http-compression') // thay thế cho 'compression' do lỗi không kết hợp được với  http2-express-bridge
const buildDir = path.join(__dirname, '../build');
// console.log('Using files in ' + buildDir);
const subDir = '/';
const logRequests = false;
const app = http2Express(express);
app.use(compression());
app.use(cors()); // Cho phép tất cả các nguồn
if (subDir === '/') {
    // console.log('The server config assuming it is serving at the server root. You can control this with the `subDir` variable in index.js.');
} else {
    // console.log('The server config assuming it is serving at \'' + subDir + '\'.');
}
if (logRequests) {
    // console.log('The server will log all incoming request. It\'s not recommended for production use.');
}

app.use('/', function (req, res, next) {
    if (req.url.endsWith('.css')) {
        console.log('CSS file requested: 1', req.url);
    }
    console.log('CSS file requested: 2', req.url);
    express.static(buildDir)(req, res, next);
})

app.get('*', (req, res) => {
    return res.sendFile(path.join(buildDir, 'index.html'));
});

// Haki.: Ghi log Fs2pro [Start]
app.use(express.json());
const port = process.env.PORT || 3001;

const isHttps = true
const isHttp2 = true
let server = null

if (isHttps) {
    const options = {
        key: fs.readFileSync(path.resolve(__dirname, 'certs/key.pem'), 'utf8'),
        cert: fs.readFileSync(path.resolve(__dirname, 'certs/cert.pem'), 'utf8'),
    };
    if (isHttp2) {
        server = http2.createSecureServer(options, app);
    } else {
        server = https.createServer(options, app);
    }
} else {
    server = app
}

const driver = neo4j.driver(
    'neo4j+s://334c407f.databases.neo4j.io',
    neo4j.auth.basic('neo4j', 'vjVQA6EcnFhMfFIPZpxofizN6OYW6EyD-tdEOGxP19I')
);
app.post('/api/query', async (req, res) => {
    const { query } = req.body;

    const session = driver.session();

    try {
        const result = await session.run(query);

        const nodesMap = new Map();
        const edges = [];

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

server.listen(port);

server.on('error', (error) => {
    console.error('Server error:', error);
});

console.log('FS2Pro App Server is listening on port ' + port);