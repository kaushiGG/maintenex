
import { ThermalImageItem } from './types';

export const generateMockThermalItems = (siteId: string): ThermalImageItem[] => {
  // Generate mock data based on site ID to ensure consistency
  const seed = siteId.charCodeAt(0) || 0;
  const hasData = seed % 3 !== 0; // Some sites will have no data
  
  if (!hasData) return [];
  
  const switchboardItems: ThermalImageItem[] = [
    {
      id: `sb-${siteId}-1`,
      name: "Main Distribution Board",
      type: "switchboard",
      location: "Building A, Ground Floor",
      status: seed % 2 === 0 ? "passed" : "failed",
      lastScanned: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days ago
      readings: [
        {
          id: `sb-${siteId}-1-r1`,
          date: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString(),
          imageUrl: "/placeholder.svg", // Using placeholder image
          temperature: 42.5,
          notes: "Regular compliance scan, all connections are within thermal limits.",
          analyst: "John Smith"
        },
        {
          id: `sb-${siteId}-1-r2`,
          date: new Date(Date.now() - (90 * 24 * 60 * 60 * 1000)).toISOString(),
          imageUrl: "/placeholder.svg",
          temperature: 41.2,
          notes: "Quarterly compliance scan, no issues detected.",
          analyst: "Emma Johnson"
        }
      ],
      notes: "Annual insurance compliance scanning required."
    },
    {
      id: `sb-${siteId}-2`,
      name: "Secondary Power Distribution",
      type: "switchboard",
      location: "Building B, Floor 2",
      status: "failed",
      lastScanned: new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)).toISOString(),
      readings: [
        {
          id: `sb-${siteId}-2-r1`,
          date: new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)).toISOString(),
          imageUrl: "/placeholder.svg",
          temperature: 68.4,
          notes: "Hot spot detected on phase 3 connection. Recommend immediate inspection by qualified electrician.",
          analyst: "David Chen"
        }
      ],
      notes: "Critical switchboard requiring bi-monthly scanning."
    },
    {
      id: `sb-${siteId}-3`,
      name: "Office Level Distribution",
      type: "switchboard",
      location: "Building A, Floor 3",
      status: "passed",
      lastScanned: new Date(Date.now() - (45 * 24 * 60 * 60 * 1000)).toISOString(),
      readings: [
        {
          id: `sb-${siteId}-3-r1`,
          date: new Date(Date.now() - (45 * 24 * 60 * 60 * 1000)).toISOString(),
          imageUrl: "/placeholder.svg",
          temperature: 38.2,
          notes: "All connections are within normal operating temperature ranges.",
          analyst: "Sarah Wilson"
        }
      ],
      notes: "Standard compliance scanning every 6 months."
    }
  ];
  
  const preventativeItems: ThermalImageItem[] = [
    {
      id: `pm-${siteId}-1`,
      name: "HVAC Compressor Unit",
      type: "preventative",
      location: "Roof, Building A",
      status: seed % 3 === 0 ? "failed" : "passed",
      lastScanned: new Date(Date.now() - (45 * 24 * 60 * 60 * 1000)).toISOString(),
      readings: [
        {
          id: `pm-${siteId}-1-r1`,
          date: new Date(Date.now() - (45 * 24 * 60 * 60 * 1000)).toISOString(),
          imageUrl: "/placeholder.svg",
          temperature: 55.8,
          notes: "Normal operating temperature for this unit. No action required.",
          analyst: "Sarah Wilson"
        }
      ]
    },
    {
      id: `pm-${siteId}-2`,
      name: "Main Server Room Cooling",
      type: "preventative",
      location: "Building A, Basement",
      status: "passed",
      lastScanned: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
      readings: [
        {
          id: `pm-${siteId}-2-r1`,
          date: new Date(Date.now() - (10 * 24 * 60 * 60 * 1000)).toISOString(),
          imageUrl: "/placeholder.svg",
          temperature: 22.3,
          notes: "Cooling systems functioning within expected parameters.",
          analyst: "Michael Brown"
        },
        {
          id: `pm-${siteId}-2-r2`,
          date: new Date(Date.now() - (100 * 24 * 60 * 60 * 1000)).toISOString(),
          imageUrl: "/placeholder.svg",
          temperature: 24.1,
          notes: "Slight increase in temperature, but still within acceptable range.",
          analyst: "Michael Brown"
        }
      ]
    }
  ];
  
  return [...switchboardItems, ...preventativeItems];
};
