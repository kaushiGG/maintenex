import React from 'react';

export interface TestTagReportProps {
  reportData?: any;
  isLoading?: boolean;
}

const TestTagReport: React.FC<TestTagReportProps> = ({ reportData, isLoading = false }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Test Tag Report</h2>
      {/* Render report data here */}
      {reportData && reportData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Site</th>
              <th>Test Date</th>
              <th>Total Items</th>
              <th>Passed Items</th>
              <th>Failed Items</th>
              <th>Next Test Due</th>
              <th>Tester</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item: any) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.siteId}</td>
                <td>{item.testDate}</td>
                <td>{item.totalItems}</td>
                <td>{item.passedItems}</td>
                <td>{item.failedItems}</td>
                <td>{item.nextTestDue}</td>
                <td>{item.tester}</td>
                <td>{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No report data available.</p>
      )}
    </div>
  );
};

export default TestTagReport;
