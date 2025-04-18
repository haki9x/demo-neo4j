import React, { useEffect, useRef, useState } from 'react';
import { DataSet, Network } from 'vis-network/standalone';
import styles from './AdminLayout.module.scss';
import InputSearch from './InputSearch';
import RelationshipTable from './RelationshipTable';
import { listRelationship } from './RelationshipTable';
import { FormControl, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { getConfigFromWindowBrowser } from '../utilities/utils';
import { ENV } from '../utilities/EWindow';
const API_SERVER_URL = getConfigFromWindowBrowser(ENV.API_SERVER_URL)

interface QueryTemplate {
    id: number;
    name: string;
    query: string;
}

interface GraphData {
    nodes: Array<{ id: string; name?: string; label?: string }>;
    edges: Array<{ from: string; to: string; label: string }>;
}

interface ReplaceEntry {
    key: string;
    value: string;
}

const AdminLayout: React.FC = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [savedQueries, setSavedQueries] = useState<QueryTemplate[]>([]);
    const [savedQueriesActive, setSavedQueriesActive] = useState<string>("");
    const [editId, setEditId] = useState<number | null>(null);
    const [newName, setNewName] = useState<string>('');
    const [newQuery, setNewQuery] = useState<string>('');
    const [detailText, setDetailText] = useState<string>('Chọn một node để xem thông tin chi tiết');
    const [selectedKeys, setSelectedKeys] = useState<any>({});
    const [selectedSymbol, setSelectedSymbol] = useState<number | string>('');

    const defaultReplaceMap: any = [
        { key: '{SYMBOL}', value: '{SYMBOL}' },
        { key: '{FULLNAME}', value: '{FULLNAME}' },
        { key: '{LIMIT}', value: '20' }
    ];

    const [replaceMap, setReplaceMap] = useState<ReplaceEntry[]>(() => {
        const saved = localStorage.getItem('replaceMap');
        return saved ? JSON.parse(saved) : defaultReplaceMap
    });

    const saveReplaceMap = (newMap: ReplaceEntry[]) => {
        setReplaceMap(newMap);
        localStorage.setItem('replaceMap', JSON.stringify(newMap));
    };

    const resetReplaceMap = () => {
        setReplaceMap(defaultReplaceMap);
        localStorage.setItem('replaceMap', JSON.stringify(defaultReplaceMap));
    };

    const defaultQueries: QueryTemplate[] = [
        {
            id: 1,
            name: 'Temp 1',
            query: `MATCH (c:Company {name: '{FULLNAME}'}) MATCH p = (c)-[*1..2]-(related:Company) WHERE related <> c RETURN p LIMIT {LIMIT}`,
        },
        {
            id: 2,
            name: 'Temp 2',
            query: `MATCH p=()-[r:WORKS_AT]->() RETURN p LIMIT {LIMIT}`,
        },
    ];

    const resetToDefault = () => {
        localStorage.setItem('savedQueries', JSON.stringify(defaultQueries));
        setSavedQueries(defaultQueries);
        setEditId(null);
        setNewName('');
        setNewQuery('');
        alert('Khôi phục về dữ liệu mặc định.');
    };


    useEffect(() => {
        const storedQueries = localStorage.getItem('savedQueries');
        if (storedQueries) {
            setSavedQueries(JSON.parse(storedQueries));
        } else {
            setSavedQueries(defaultQueries);
            localStorage.setItem('savedQueries', JSON.stringify(defaultQueries));
        }
    }, []);

    const applyReplacements = (query: string): string => {
        let result = query;
        replaceMap.forEach(({ key, value }) => {
            const pattern = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            if (value == "{SYMBOL}" || value == "{FULLNAME}") {
                const key = value.replace(/{|}/g, '');
                if (selectedKeys[key]?.trim()) {
                    value = selectedKeys[key];
                } else {
                    value = "";
                }
            }
            result = result.replace(pattern, value);
        });
        // console.log(result, replaceMap, selectedKeys)
        return result;
    };

    const fetchGraphData = async (q: string): Promise<GraphData | null> => {
        setSavedQueriesActive(q)
        if (!q?.trim()) {
            alert("Không có câu lệnh để khởi chạy!");
            return null;
        }
        try {
            const response = await fetch(`${API_SERVER_URL}/api/query`, {
                // const response = await fetch('http://localhost:3001/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q }),
            });

            if (!response.ok) throw new Error('Server không trả về kết quả hợp lệ');

            const data = await response.json();
            return {
                nodes: data.nodes || [],
                edges: data.edges || [],
            };
        } catch (err) {
            console.error('Error khi gọi API:', err);
            return { nodes: [], edges: [] };
        }
    };

    const truncateText = (text: string, maxLength = 15): string => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const updatedEdgeStyle = (label: string) => {
        let edgeColor = "gray"
        switch (label) {
            case "INVESTED_IN":
                edgeColor = listRelationship.INVESTED_IN.color;
                break;
            case "OWNS_SUBSIDIARY":
                edgeColor = listRelationship.OWNS_SUBSIDIARY.color;
                break;
            case "RELATED_TO":
                edgeColor = listRelationship.RELATED_TO.color;
                break;
            case "SHAREHOLDER_OF":
                edgeColor = listRelationship.SHAREHOLDER_OF.color;
                break;
            case "WORKS_WITH":
                edgeColor = listRelationship.WORKS_WITH.color;
                break;
            default:
                edgeColor = "gray";  // Màu mặc định cho các mối quan hệ không xác định
        }
        return { color: edgeColor }
    };


    const updatedNodeStyle = (node: any) => {
        const groups: any = {
            Person: { color: { background: '#6BA5FF', border: '#0044bb', highlight: { background: '#A8C7FF', border: '#0044bb' } } },
            Company: { color: { background: '#FFB347', border: '#FF8C00', highlight: { background: '#FFD39B', border: '#FF7000' } } },
        }
        const groupsSymbolMain: any = {
            Person: { color: { background: 'green', border: '#0044bb', highlight: { background: 'green', border: '#0044bb' } } },
            Company: { color: { background: 'red', border: '#FF8C00', highlight: { background: 'red', border: '#FF7000' } } },
        }
        let nodeColor = groups[node?.label]
        const fullName = selectedKeys["FULLNAME"]
        if (fullName && fullName == node?.name) {
            nodeColor = groupsSymbolMain[node?.label]
        }
        return nodeColor
    };

    const runQuery = async (originalQuery: string, nameQuery: string) => {
        _setSelectedKeys("nameQueryActive", nameQuery)
        try {
            const query = applyReplacements(originalQuery);
            const result = await fetchGraphData(query);
            if (!result) return;

            const { nodes: rawNodes, edges: rawEdges } = result;
            const nodes = rawNodes.map((n: any) => ({
                id: n.id,
                label: truncateText(n.name || n.label, 15),
                fullLabel: n.name || n.label,
                group: n.label,
                ...updatedNodeStyle(n)
            }));

            const edges = rawEdges.map((e: any) => ({
                from: e.from,
                to: e.to,
                // label: e.label,
                arrows: 'to',
                ...updatedEdgeStyle(e.label)
            }));

            const data = { nodes, edges };

            const options = {
                nodes: {
                    widthConstraint: { minimum: 60, maximum: 70 },
                    heightConstraint: { minimum: 40, maximum: 50 },
                    scaling: { min: 10, max: 10, customScalingFunction: () => 5 },
                    shapeProperties: { useImageSize: false },
                    shape: 'circle',
                    font: { size: 12, color: '#fff', face: 'Arial', vadjust: 0 },
                    // color: { background: '#6BA5FF', border: '#0057e7', highlight: { background: '#A8C7FF', border: '#0044bb' } },
                    borderWidth: 2,
                },
                edges: {
                    arrows: { to: { enabled: true } },
                    font: { align: 'middle' },
                    smooth: true,
                    // color: 'gray',
                    length: 200,
                },

                physics: {
                    forceAtlas2Based: { gravitationalConstant: 0, centralGravity: 5, springLength: 1250, springConstant: 5 },
                    maxVelocity: 500,
                    solver: 'forceAtlas2Based',
                    stabilization: { iterations: 150 },
                    enabled: false,
                },
                // groups: {
                //   Person: { color: { background: '#6BA5FF', border: '#0044bb', highlight: { background: '#A8C7FF', border: '#0044bb' } } },
                //   Company: { color: { background: '#FFB347', border: '#FF8C00', highlight: { background: '#FFD39B', border: '#FF7000' } } },
                // },
            };

            const network = new Network(containerRef.current as HTMLElement, data, options);

            network.on('click', (params) => {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    const node = nodes.find((n) => n.id === nodeId);
                    if (node) {
                        setDetailText(`Node ID: ${node.id}\nFull Name: ${node.fullLabel}\nGroup: ${node.group}`);
                    }
                } else {
                    setDetailText('Chọn một node để xem thông tin chi tiết');
                }
            });

        } catch (err) {
            console.error('Neo4j Viz error:', err);
        }
    };

    const addNewTemplate = () => {
        if (!newName.trim() || !newQuery.trim()) return;
        const newTemplate: QueryTemplate = { id: Date.now(), name: newName, query: newQuery };
        const _savedQueries = [...savedQueries, newTemplate];
        setSavedQueries(_savedQueries);
        setNewName('');
        setNewQuery('');
        localStorage.setItem('savedQueries', JSON.stringify(_savedQueries));
    };

    const startEdit = (id: number) => {
        const existing = savedQueries.find((q) => q.id === id);
        if (existing) {
            setEditId(id);
            setNewName(existing.name);
            setNewQuery(existing.query);
        }
    };

    const updateTemplate = () => {
        const updated = savedQueries.map((q) => q.id === editId ? { ...q, name: newName, query: newQuery } : q);
        setSavedQueries(updated);
        setEditId(null);
        setNewName('');
        setNewQuery('');
        localStorage.setItem('savedQueries', JSON.stringify(updated));
    };

    const deleteTemplate = (id: number) => {
        if (window.confirm('Bạn có chắc muốn xóa truy vấn này không?')) {
            const _savedQueries = savedQueries.filter((q) => q.id !== id);
            setSavedQueries(_savedQueries);
            localStorage.setItem('savedQueries', JSON.stringify(_savedQueries));
        }
    };

    const _setSelectedKeys = (key: string, value: string) => {
        setSelectedKeys((prev: any) => ({ ...prev, [key]: value }));
    };


    useEffect(() => {
        fetchSymbols();
        const storedQueries = localStorage.getItem('savedQueries');
        if (storedQueries) {
            setSavedQueries(JSON.parse(storedQueries));
        } else {
            setSavedQueries(defaultQueries);
            localStorage.setItem('savedQueries', JSON.stringify(defaultQueries));
        }
    }, []);

    const fetchSymbols = async () => {
        try {
            // const response = await fetch('https://price.vixs.vn/datafeed/instruments?brief=true');
            // const response = await fetch('${API_MARKET_URL}/instruments?brief=true');
            // let data = await response.json();
            // data = data && data.d;
            // setSymbols(data);
            // // Gán mã chứng khoán đầu tiên làm giá trị mặc định
            // if (data && data.length > 0) {
            //   setSelectedSymbol(data[0].symbol); // Mã chứng khoán đầu tiên
            //   _setSelectedKeys("SYMBOL", data[0].symbol)
            //   _setSelectedKeys("FULLNAME", data[0].symbol)
            // }

            // return null;
            const response2 = await fetch(`${API_SERVER_URL}/api/company`, {
                // const response2 = await fetch('http://localhost:3001/api/company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });
            if (!response2.ok) throw new Error('Server không trả về kết quả hợp lệ');

            const data2 = await response2.json();
            setSymbols(data2);
            // console.log("data2.:", data2)
            if (data2 && data2.length > 0) {
                setSelectedSymbol(data2[0].symbol); // Mã chứng khoán đầu tiên
                _setSelectedKeys("SYMBOL", data2[0].symbol)
                _setSelectedKeys("FULLNAME", data2[0].FullName)
            }

        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu chứng khoán:', error);
        } finally {
        }
    };

    const handleChangeSymbol = (s: any) => {
        // console.log("handleChangeSymbol.:", s)
        if (s) {
            setSelectedSymbol(s?.symbol);
            _setSelectedKeys("SYMBOL", s?.symbol)
            _setSelectedKeys("FULLNAME", s?.FullName)
        }
        else {
            setSelectedSymbol("")
            _setSelectedKeys("SYMBOL", "")
            _setSelectedKeys("FULLNAME", "")
        }
    };
    const [symbols, setSymbols] = useState<any[]>([]);

    const exportImage = () => {
        if (!containerRef.current || !String(selectedSymbol).trim()) return;
        const canvas = containerRef.current.querySelector('canvas') as HTMLCanvasElement;
        if (!canvas) {
            alert("Không tìm thấy canvas của vis-network.");
            return;
        }

        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = `${selectedKeys["nameQueryActive"]}-graph-${selectedKeys["SYMBOL"]}.png`;
        link.click();
    };

    return (
        <div className={styles.neo4jContainer}>
            <div className={styles.sectionTitle}>Phân tích dữ liệu: ADMIN</div>
            <div className={styles.stepTitle}>1. Tạo mới sơ đồ</div>
            <div className={styles.inputGroup}>
                <FormControl fullWidth>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <InputSearch
                            data={symbols}
                            defaultValue={String(selectedSymbol)}
                            searchTerm={String(selectedSymbol)}
                            onSearchTermChange={setSelectedSymbol}
                            onOptionSelect={handleChangeSymbol}
                            label={"Nhập mã CK"}
                            getOptionLabel={(option: any) => `${option.symbol} - ${option.FullName}`}
                            getOptionShowInput={(option: any) => `${option.symbol}`}
                        />
                        <p className="FULLNAME" style={{ fontSize: "20px", color: "red" }}>{selectedKeys["FULLNAME"]}</p>
                    </div>
                    ---
                </FormControl>
                <input
                    type="text"
                    placeholder="Tên Sơ đồ"
                    value={newName}
                    style={{ width: '300px' }}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Câu lệnh"
                    value={newQuery}
                    style={{ width: '700px' }}
                    onChange={(e) => setNewQuery(e.target.value)}
                />
                {editId ? (
                    <button className={styles.addButton} onClick={updateTemplate}>Cập nhật</button>
                ) : (
                    <button className={styles.addButton} onClick={addNewTemplate}>Thêm</button>
                )}
                <button className={styles.runQueryButton} onClick={() => runQuery(newQuery, newName)}>Chạy query</button>
            </div>

            <div className={styles.stepTitle}>2. Quản lý danh sách</div>
            <div className={styles.inputGroup}>
                <button className={styles.resetButton} onClick={resetToDefault}>Reset dữ liệu</button>
            </div>

            <div className={styles.tableContainer}>
                <table>
                    <thead>
                        <tr>
                            <th>Tên Sơ đồ</th>
                            <th>Câu lệnh</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {savedQueries.map((query) => (
                            <tr key={query.id}>
                                <td>{query.name}</td>
                                <td><code>{query.query}</code></td>
                                <td className={styles.actionButtons}>
                                    <button className={styles.runButton} onClick={() => runQuery(query.query, query.name)}>Chạy</button>
                                    <button className={styles.editButton} onClick={() => startEdit(query.id)}>Sửa</button>
                                    <button className={styles.deleteButton} onClick={() => deleteTemplate(query.id)}>Xóa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.stepTitle}>3. Danh sách Key-Value Replace</div>
            <div className={styles.inputGroup}>
                {replaceMap.map((entry, index) => (
                    <div key={index} style={{ marginBottom: '5px' }}>
                        <input
                            type="text"
                            value={entry.key}
                            style={{ width: '150px', marginRight: '10px' }}
                            onChange={(e) => {
                                const updated = [...replaceMap];
                                updated[index].key = e.target.value;
                                saveReplaceMap(updated);
                            }}
                        />
                        <input
                            type="text"
                            value={entry.value}
                            style={{ width: '150px', marginRight: '10px' }}
                            onChange={(e) => {
                                const updated = [...replaceMap];
                                updated[index].value = e.target.value;
                                saveReplaceMap(updated);
                            }}
                        />
                        <button
                            className={styles.deleteButton}
                            onClick={() => {
                                const updated = replaceMap.filter((_, i) => i !== index);
                                saveReplaceMap(updated);
                            }}
                        >Xóa</button>
                    </div>
                ))}
                <button
                    className={styles.addButton}
                    onClick={() => saveReplaceMap([...replaceMap, { key: '', value: '' }])}
                >Thêm từ khóa</button>
                <button
                    className={styles.resetButton}
                    onClick={() => resetReplaceMap()}
                >Reset Bộ Key</button>
            </div>

            <div className={styles.stepTitle}>4. Hiển thị sơ đồ</div> {savedQueriesActive}
            <div className={styles.Neo4jChart}>
                <div className={styles.graphArea} style={{ height: '700px', position: 'relative' }}>
                    {/* <div ref={containerRef} className={styles.graphContainer} style={{ height: '700px' }}></div> */}
                    <IconButton
                        id="download-icon-button"
                        onClick={exportImage}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            zIndex: 10,
                            backgroundColor: '#1976d2',
                            color: '#fff',
                        }}
                    >
                        <DownloadIcon />
                    </IconButton>
                    <div ref={containerRef} className={styles.graphContainer} style={{ height: '700px' }}></div>
                </div>
                <div className={styles.detailsArea}>
                    <div className={styles.stepTitle2}>
                        1. Bảng màu các mỗi quan hệ Relationship
                    </div>
                    <RelationshipTable />
                    <div className={styles.stepTitle2}>
                        2. Thông tin chi tiết
                    </div>
                    <pre>{detailText}</pre>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
