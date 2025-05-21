
import React from 'react';

export interface ThermalImagingReportProps {
  reportData?: any;
  isLoading?: boolean;
}

const ThermalImagingReport: React.FC<ThermalImagingReportProps> = ({ reportData, isLoading = false }) => {
  return (
    <div>
      <h2>Thermal Imaging Report</h2>
      {isLoading ? (
        <p>Loading report data...</p>
      ) : reportData ? (
        <pre>{JSON.stringify(reportData, null, 2)}</pre>
      ) : (
        <p>No report data available.</p>
      )}
    </div>
  );
};

export default ThermalImagingReport;
