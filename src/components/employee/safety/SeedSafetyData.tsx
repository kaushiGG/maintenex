import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Sample equipment data with safety information
const SAMPLE_EQUIPMENT = [
  {
    name: 'Bottling Machine',
    manufacturer: 'BottleTech Industries',
    model: 'BF-2000',
    category: 'Bottling Machine',
    serial_number: 'BT42389',
    location: 'Main Production Floor',
    status: 'active',
    notes: 'Primary bottling machine for water products',
    safety_frequency: 'weekly',
    safety_instructions: '1. Check all safety guards are in place\n2. Verify emergency stop button functionality\n3. Inspect belts and conveyors for wear\n4. Test pressure systems\n5. Clean and sanitize all contact surfaces',
    safety_officer: 'John Smith',
    last_safety_check: null,
    safety_status: 'pending'
  },
  {
    name: 'Bottling Machine A1',
    manufacturer: 'BottleTech Industries',
    model: 'BF-2000',
    category: 'Bottling Machine',
    serial_number: 'BT42390',
    location: 'Main Production Floor',
    status: 'active',
    notes: 'Secondary bottling machine for juice products',
    safety_frequency: 'weekly',
    safety_instructions: '1. Check all safety guards are in place\n2. Verify emergency stop button functionality\n3. Inspect belts and conveyors for wear\n4. Test pressure systems\n5. Clean and sanitize all contact surfaces',
    safety_officer: 'John Smith',
    last_safety_check: null,
    safety_status: 'pending'
  },
  {
    name: 'Bottling Capping System X3',
    manufacturer: 'CapMaster',
    model: 'CM-X3',
    category: 'Bottling Machine',
    serial_number: 'CM98765',
    location: 'Production Line 2',
    status: 'active',
    notes: 'High-speed capping system for plastic bottles',
    safety_frequency: 'monthly',
    safety_instructions: '1. Inspect pneumatic systems\n2. Check cap feed mechanism\n3. Test torque settings\n4. Verify safety interlocks\n5. Clean debris from moving parts',
    safety_officer: 'Sarah Johnson',
    last_safety_check: null,
    safety_status: 'pending'
  },
  {
    name: 'Industrial Bottling Washer',
    manufacturer: 'CleanTech',
    model: 'BW-5000',
    category: 'Bottling Machine',
    serial_number: 'CT77123',
    location: 'Pre-Production Area',
    status: 'active',
    notes: 'High-capacity bottle washing system',
    safety_frequency: 'daily',
    safety_instructions: '1. Check chemical levels and mixing ratios\n2. Inspect spray nozzles for clogs\n3. Test water temperature controls\n4. Verify drain systems\n5. Check conveyor tracking',
    safety_officer: 'Michael Chen',
    last_safety_check: null,
    safety_status: 'pending'
  },
  {
    name: 'Bottling Labeling Machine',
    manufacturer: 'LabelPro',
    model: 'LP-3000',
    category: 'Bottling Machine',
    serial_number: 'LP44556',
    location: 'Finishing Department',
    status: 'active',
    notes: 'Automatic labeling system for bottles',
    safety_frequency: 'weekly',
    safety_instructions: '1. Check label alignment sensors\n2. Inspect adhesive application system\n3. Test emergency stops\n4. Verify label stock feed\n5. Clean rollers and contact surfaces',
    safety_officer: 'Jessica Williams',
    last_safety_check: null,
    safety_status: 'pending'
  }
];

const SeedSafetyData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleSeedData = async () => {
    setIsLoading(true);
    try {
      // First check if equipment table already has data
      const { data: existingData, error: checkError } = await supabase
        .from('equipment')
        .select('id')
        .limit(1);

      if (checkError) throw checkError;

      // If data already exists, check if it has safety data
      if (existingData && existingData.length > 0) {
        const { data: safetyData, error: safetyCheckError } = await supabase
          .from('equipment')
          .select('id')
          .not('safety_frequency', 'is', null)
          .limit(1);
          
        if (safetyCheckError) throw safetyCheckError;
        
        // If safety data already exists, inform the user
        if (safetyData && safetyData.length > 0) {
          toast.info('Equipment with safety data already exists in the database.');
          setIsComplete(true);
          return;
        }
        
        // If equipment exists but without safety data, update the existing equipment
        for (const sample of SAMPLE_EQUIPMENT) {
          const { error: updateError } = await supabase
            .from('equipment')
            .update({
              safety_frequency: sample.safety_frequency,
              safety_instructions: sample.safety_instructions,
              safety_officer: sample.safety_officer
            })
            .eq('name', sample.name);
            
          if (updateError) {
            console.warn(`Failed to update equipment ${sample.name}:`, updateError);
          }
        }
        
        toast.success('Added safety data to existing equipment!');
      } else {
        // If no equipment exists, insert the samples
        const { data, error } = await supabase
          .from('equipment')
          .insert(SAMPLE_EQUIPMENT);
          
        if (error) throw error;
        
        toast.success('Sample equipment with safety data has been added!');
      }
      
      setIsComplete(true);
      
      // Reload the page after a short delay to show the new data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Failed to add sample data. Please check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      {isComplete ? (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="text-green-800 mb-2">Sample data has been added successfully!</p>
          <p className="text-green-700 text-sm">The page will reload momentarily to display the data.</p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-blue-800 mb-2">No bottling machine data was found in the database.</p>
          <p className="text-blue-700 text-sm mb-4">Click the button below to add sample bottling machine equipment including one with the exact name "Bottling Machine".</p>
          <Button 
            onClick={handleSeedData}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Sample Data...
              </>
            ) : (
              'Add Bottling Machine Data'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SeedSafetyData; 