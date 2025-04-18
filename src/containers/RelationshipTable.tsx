import React from 'react';

type RelationshipKey =
  | 'INVESTED_IN'
  | 'OWNS_SUBSIDIARY'
  | 'RELATED_TO'
  | 'SHAREHOLDER_OF'
  | 'WORKS_WITH';

interface RelationshipInfo {
  color: string;
}

export const listRelationship: Record<RelationshipKey, RelationshipInfo> = {
  INVESTED_IN: { color: "#FF4136" },      // Đỏ tươi
  OWNS_SUBSIDIARY: { color: "#8E44AD" },  // Tím đậm
  RELATED_TO: { color: "#2ECC40" },       // Xanh lá cây tươi
  SHAREHOLDER_OF: { color: "#FFDC00" },   // Vàng sáng
  WORKS_WITH: { color: "#1E90FF" }        // Xanh dương sáng
};

const RelationshipTable: React.FC = () => {
  return (
    <div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }} border={1}>
        <thead>
          <tr>
            <th>Key</th>
            <th>Color</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(listRelationship).map(([key, { color }]) => (
            <tr key={key}>
              <td>{key}</td>
              <td style={{ backgroundColor: color }}>{color}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RelationshipTable;
