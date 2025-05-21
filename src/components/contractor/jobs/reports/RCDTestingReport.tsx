import React from 'react';

export interface RCDTestingReportProps {
  reportData?: any;
  isLoading?: boolean;
}

const RCDTestingReport: React.FC<RCDTestingReportProps> = ({ reportData, isLoading = false }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">RCD Testing Report</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : reportData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Total RCDs Tested</p>
                <p className="text-2xl font-bold">{reportData.totalTested || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Pass Rate</p>
                <p className="text-2xl font-bold text-green-600">{reportData.passRate || '0%'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500">Fail Rate</p>
                <p className="text-2xl font-bold text-red-600">{reportData.failRate || '0%'}</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Test Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        RCD ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trip Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.items && reportData.items.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.rcdId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.tripTime}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.status === 'passed' ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {reportData.notes && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Additional Notes</h3>
                <p className="text-gray-700">{reportData.notes}</p>
              </div>
            )}
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Recommendations</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Next testing due: {reportData.nextTestDue || 'Not specified'}</li>
                <li>Failed RCDs should be replaced or repaired immediately</li>
                <li>Maintain regular testing schedule according to AS/NZS 3760</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No RCD testing data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RCDTestingReport;
