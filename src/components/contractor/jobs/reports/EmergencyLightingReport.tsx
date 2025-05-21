import React from 'react';

export interface EmergencyLightingReportProps {
  reportData?: any;
  isLoading?: boolean;
}

const EmergencyLightingReport: React.FC<EmergencyLightingReportProps> = ({ reportData, isLoading = false }) => {
  if (isLoading) {
    return <div>Loading emergency lighting report data...</div>;
  }

  if (!reportData) {
    return <div>No emergency lighting report data available.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Emergency Lighting Report</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Report Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-md p-4">
            <p className="text-sm text-gray-500">Total Fixtures</p>
            <p className="text-2xl font-bold">{reportData.totalFixtures || 0}</p>
          </div>
          <div className="border rounded-md p-4">
            <p className="text-sm text-gray-500">Passed</p>
            <p className="text-2xl font-bold text-green-600">{reportData.passedFixtures || 0}</p>
          </div>
          <div className="border rounded-md p-4">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="text-2xl font-bold text-red-600">{reportData.failedFixtures || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fixture Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.fixtures && reportData.fixtures.map((fixture: any, index: number) => (
              <tr key={fixture.id || index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{fixture.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fixture.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    fixture.status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {fixture.status === 'pass' ? 'Pass' : 'Fail'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fixture.batteryDuration} minutes</td>
                <td className="px-6 py-4 text-sm text-gray-500">{fixture.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reportData.recommendations && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <ul className="list-disc pl-5 space-y-2">
            {reportData.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-gray-700">{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmergencyLightingReport;
