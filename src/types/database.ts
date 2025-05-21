export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_feed: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          type?: string | null
        }
        Relationships: []
      }
      business_sites: {
        Row: {
          address: string
          compliance_status: string | null
          contact_email: string | null
          contact_phone: string | null
          coordinates: string | null
          created_at: string
          id: string
          item_count: number | null
          name: string
          notes: string | null
          owner_id: string
          site_type: string | null
          updated_at: string
        }
        Insert: {
          address: string
          compliance_status?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          coordinates?: string | null
          created_at?: string
          id?: string
          item_count?: number | null
          name: string
          notes?: string | null
          owner_id: string
          site_type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          compliance_status?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          coordinates?: string | null
          created_at?: string
          id?: string
          item_count?: number | null
          name?: string
          notes?: string | null
          owner_id?: string
          site_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      compliance_reports: {
        Row: {
          audit_date: string
          created_by: string | null
          id: string
          notes: string | null
          score: number
          site_id: string
          status: string
        }
        Insert: {
          audit_date?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          score: number
          site_id: string
          status: string
        }
        Update: {
          audit_date?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          score?: number
          site_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_availability: {
        Row: {
          created_at: string
          friday: boolean | null
          id: string
          monday: boolean | null
          owner_id: string | null
          saturday: boolean | null
          sunday: boolean | null
          thursday: boolean | null
          tuesday: boolean | null
          updated_at: string
          wednesday: boolean | null
        }
        Insert: {
          created_at?: string
          friday?: boolean | null
          id?: string
          monday?: boolean | null
          owner_id?: string | null
          saturday?: boolean | null
          sunday?: boolean | null
          thursday?: boolean | null
          tuesday?: boolean | null
          updated_at?: string
          wednesday?: boolean | null
        }
        Update: {
          created_at?: string
          friday?: boolean | null
          id?: string
          monday?: boolean | null
          owner_id?: string | null
          saturday?: boolean | null
          sunday?: boolean | null
          thursday?: boolean | null
          tuesday?: boolean | null
          updated_at?: string
          wednesday?: boolean | null
        }
        Relationships: []
      }
      contractor_insurance: {
        Row: {
          contractor_id: string
          contractor_name: string
          coverage: string
          created_at: string
          expiry_date: string
          id: string
          insurance_type: string
          issue_date: string
          notes: string | null
          owner_id: string | null
          policy_number: string
          provider: string
          status: string
          updated_at: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          contractor_id: string
          contractor_name: string
          coverage: string
          created_at?: string
          expiry_date: string
          id?: string
          insurance_type: string
          issue_date: string
          notes?: string | null
          owner_id?: string | null
          policy_number: string
          provider: string
          status?: string
          updated_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          contractor_id?: string
          contractor_name?: string
          coverage?: string
          created_at?: string
          expiry_date?: string
          id?: string
          insurance_type?: string
          issue_date?: string
          notes?: string | null
          owner_id?: string | null
          policy_number?: string
          provider?: string
          status?: string
          updated_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_contractor_insurance_contractor"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_licenses: {
        Row: {
          contractor_id: string | null
          contractor_name: string
          created_at: string
          expiry_date: string
          id: string
          issue_date: string
          license_number: string
          license_type: string
          notes: string | null
          provider: string
          status: string
          updated_at: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          contractor_id?: string | null
          contractor_name: string
          created_at?: string
          expiry_date: string
          id?: string
          issue_date: string
          license_number: string
          license_type: string
          notes?: string | null
          provider: string
          status?: string
          updated_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          contractor_id?: string | null
          contractor_name?: string
          created_at?: string
          expiry_date?: string
          id?: string
          issue_date?: string
          license_number?: string
          license_type?: string
          notes?: string | null
          provider?: string
          status?: string
          updated_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_licenses_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          auth_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          credentials: string | null
          id: string
          job_title: string | null
          location: string | null
          name: string
          notes: string | null
          owner_id: string | null
          rating: number | null
          service_type: string
          skills: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          credentials?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          rating?: number | null
          service_type: string
          skills?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          credentials?: string | null
          id?: string
          job_title?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          rating?: number | null
          service_type?: string
          skills?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_lighting_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          failed_lights: number | null
          id: string
          job_id: string | null
          lighting_details: Json | null
          next_test_due: string | null
          passed_lights: number | null
          site_id: string | null
          status: string | null
          test_date: string | null
          total_lights: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          failed_lights?: number | null
          id?: string
          job_id?: string | null
          lighting_details?: Json | null
          next_test_due?: string | null
          passed_lights?: number | null
          site_id?: string | null
          status?: string | null
          test_date?: string | null
          total_lights?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          failed_lights?: number | null
          id?: string
          job_id?: string | null
          lighting_details?: Json | null
          next_test_due?: string | null
          passed_lights?: number | null
          site_id?: string | null
          status?: string | null
          test_date?: string | null
          total_lights?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_lighting_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_lighting_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          attachments: Json | null
          authorized_officers: string[] | null
          category: string
          created_at: string
          id: string
          last_safety_check: string | null
          location: string
          manufacturer: string | null
          model: string | null
          name: string
          next_service_date: string | null
          notes: string | null
          owner_id: string | null
          purchase_date: string | null
          safety_frequency: string | null
          safety_instructions: string | null
          safety_manager_id: string | null
          safety_notes: string | null
          safety_status: string | null
          serial_number: string | null
          site_id: string | null
          status: string
          training_video_name: string | null
          training_video_url: Json | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          attachments?: Json | null
          authorized_officers?: string[] | null
          category: string
          created_at?: string
          id?: string
          last_safety_check?: string | null
          location: string
          manufacturer?: string | null
          model?: string | null
          name: string
          next_service_date?: string | null
          notes?: string | null
          owner_id?: string | null
          purchase_date?: string | null
          safety_frequency?: string | null
          safety_instructions?: string | null
          safety_manager_id?: string | null
          safety_notes?: string | null
          safety_status?: string | null
          serial_number?: string | null
          site_id?: string | null
          status: string
          training_video_name?: string | null
          training_video_url?: Json | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          attachments?: Json | null
          authorized_officers?: string[] | null
          category?: string
          created_at?: string
          id?: string
          last_safety_check?: string | null
          location?: string
          manufacturer?: string | null
          model?: string | null
          name?: string
          next_service_date?: string | null
          notes?: string | null
          owner_id?: string | null
          purchase_date?: string | null
          safety_frequency?: string | null
          safety_instructions?: string | null
          safety_manager_id?: string | null
          safety_notes?: string | null
          safety_status?: string | null
          serial_number?: string | null
          site_id?: string | null
          status?: string
          training_video_name?: string | null
          training_video_url?: Json | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_safety_manager_id_fkey"
            columns: ["safety_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          department: string | null
          email: string
          expires_at: string
          first_name: string
          id: string
          invitation_type: string
          invited_at: string
          inviter_id: string
          is_safety_officer: boolean
          last_name: string
          message: string | null
          role: string | null
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          department?: string | null
          email: string
          expires_at?: string
          first_name: string
          id?: string
          invitation_type?: string
          invited_at?: string
          inviter_id: string
          is_safety_officer?: boolean
          last_name: string
          message?: string | null
          role?: string | null
          status?: string
          token: string
          updated_at?: string | null
        }
        Update: {
          department?: string | null
          email?: string
          expires_at?: string
          first_name?: string
          id?: string
          invitation_type?: string
          invited_at?: string
          inviter_id?: string
          is_safety_officer?: boolean
          last_name?: string
          message?: string | null
          role?: string | null
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          assigned_to: string | null
          assignment_method: string | null
          assignment_notes: string | null
          attachments: Json | null
          building_type: string | null
          completion_time: string | null
          contractor_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          equipment_id: string | null
          id: string
          job_type: string | null
          location_details: string | null
          priority: string | null
          schedule_notes: string | null
          service_details: string | null
          service_type: string
          site_id: string | null
          start_date: string | null
          start_time: string | null
          status: string
          time_spent: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          assignment_method?: string | null
          assignment_notes?: string | null
          attachments?: Json | null
          building_type?: string | null
          completion_time?: string | null
          contractor_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          equipment_id?: string | null
          id?: string
          job_type?: string | null
          location_details?: string | null
          priority?: string | null
          schedule_notes?: string | null
          service_details?: string | null
          service_type: string
          site_id?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: string
          time_spent?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          assignment_method?: string | null
          assignment_notes?: string | null
          attachments?: Json | null
          building_type?: string | null
          completion_time?: string | null
          contractor_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          equipment_id?: string | null
          id?: string
          job_type?: string | null
          location_details?: string | null
          priority?: string | null
          schedule_notes?: string | null
          service_details?: string | null
          service_type?: string
          site_id?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: string
          time_spent?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      license_types: {
        Row: {
          created_at: string
          icon_name: string
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string
          icon_name: string
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string
          icon_name?: string
          id?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          id: string
          settings: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          company: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          is_approved: boolean | null
          last_name: string | null
          phone: string | null
          updated_at: string
          user_type: string | null
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          is_approved?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          is_approved?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: string | null
        }
        Relationships: []
      }
      rcd_testing_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          failed_rcds: number | null
          id: string
          job_id: string | null
          next_test_due: string | null
          passed_rcds: number | null
          rcd_details: Json | null
          site_id: string | null
          status: string | null
          test_date: string | null
          total_rcds: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          failed_rcds?: number | null
          id?: string
          job_id?: string | null
          next_test_due?: string | null
          passed_rcds?: number | null
          rcd_details?: Json | null
          site_id?: string | null
          status?: string | null
          test_date?: string | null
          total_rcds?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          failed_rcds?: number | null
          id?: string
          job_id?: string | null
          next_test_due?: string | null
          passed_rcds?: number | null
          rcd_details?: Json | null
          site_id?: string | null
          status?: string | null
          test_date?: string | null
          total_rcds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rcd_testing_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rcd_testing_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_checks: {
        Row: {
          check_data: Json
          created_at: string | null
          equipment_id: string
          id: string
          issues: string | null
          notes: string | null
          performed_by: string | null
          performed_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          check_data: Json
          created_at?: string | null
          equipment_id: string
          id?: string
          issues?: string | null
          notes?: string | null
          performed_by?: string | null
          performed_date?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          check_data?: Json
          created_at?: string | null
          equipment_id?: string
          id?: string
          issues?: string | null
          notes?: string | null
          performed_by?: string | null
          performed_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_checks_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_services: {
        Row: {
          assigned_to: string
          created_at: string
          description: string
          equipment_id: string
          id: string
          notes: string | null
          priority: string
          service_date: string
          service_type: string
          status: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          description: string
          equipment_id: string
          id?: string
          notes?: string | null
          priority: string
          service_date: string
          service_type: string
          status?: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          description?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          priority?: string
          service_date?: string
          service_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_services_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      service_areas: {
        Row: {
          contractor_id: string | null
          coordinates: string
          created_at: string
          id: string
          name: string
          postcodes: string
          radius: number
          status: string
        }
        Insert: {
          contractor_id?: string | null
          coordinates: string
          created_at?: string
          id?: string
          name: string
          postcodes: string
          radius: number
          status?: string
        }
        Update: {
          contractor_id?: string | null
          coordinates?: string
          created_at?: string
          id?: string
          name?: string
          postcodes?: string
          radius?: number
          status?: string
        }
        Relationships: []
      }
      site_contractors: {
        Row: {
          contractor_id: string
          created_at: string
          id: string
          site_id: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          id?: string
          site_id: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          id?: string
          site_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_contractors_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_equipment: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          id: string
          last_serviced: string | null
          location: string
          name: string
          next_service: string | null
          notes: string | null
          site_id: string
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_serviced?: string | null
          location: string
          name: string
          next_service?: string | null
          notes?: string | null
          site_id: string
          status: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          last_serviced?: string | null
          location?: string
          name?: string
          next_service?: string | null
          notes?: string | null
          site_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_equipment_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_floor_plans: {
        Row: {
          created_at: string | null
          file_path: string
          file_type: string | null
          id: string
          name: string
          site_id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_type?: string | null
          id?: string
          name: string
          site_id: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_type?: string | null
          id?: string
          name?: string
          site_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_floor_plans_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_requirements: {
        Row: {
          attachments: Json | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          effective_date: string
          frequency: string
          id: string
          last_updated: string
          related_sites: string[]
          title: string
        }
        Insert: {
          attachments?: Json | null
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          effective_date: string
          frequency: string
          id?: string
          last_updated?: string
          related_sites: string[]
          title: string
        }
        Update: {
          attachments?: Json | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          effective_date?: string
          frequency?: string
          id?: string
          last_updated?: string
          related_sites?: string[]
          title?: string
        }
        Relationships: []
      }
      test_and_tag_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          failed_items: number | null
          id: string
          inspection_date: string | null
          items: Json | null
          job_id: string | null
          next_test_due: string | null
          passed_items: number | null
          site_id: string | null
          status: string | null
          total_items: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          failed_items?: number | null
          id?: string
          inspection_date?: string | null
          items?: Json | null
          job_id?: string | null
          next_test_due?: string | null
          passed_items?: number | null
          site_id?: string | null
          status?: string | null
          total_items?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          failed_items?: number | null
          id?: string
          inspection_date?: string | null
          items?: Json | null
          job_id?: string | null
          next_test_due?: string | null
          passed_items?: number | null
          site_id?: string | null
          status?: string | null
          total_items?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_and_tag_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_and_tag_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      thermal_reports: {
        Row: {
          ambient_temperature: number | null
          analysis_date: string | null
          analysis_results: Json | null
          created_at: string | null
          created_by: string | null
          equipment: string | null
          hotspots: Json | null
          id: string
          image_type: string
          job_id: string | null
          location: string | null
          max_temperature: number | null
          min_temperature: number | null
          normal_image: string | null
          notes: string | null
          site_id: string | null
          status: string | null
          updated_at: string | null
          uploaded_image: string | null
        }
        Insert: {
          ambient_temperature?: number | null
          analysis_date?: string | null
          analysis_results?: Json | null
          created_at?: string | null
          created_by?: string | null
          equipment?: string | null
          hotspots?: Json | null
          id?: string
          image_type: string
          job_id?: string | null
          location?: string | null
          max_temperature?: number | null
          min_temperature?: number | null
          normal_image?: string | null
          notes?: string | null
          site_id?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_image?: string | null
        }
        Update: {
          ambient_temperature?: number | null
          analysis_date?: string | null
          analysis_results?: Json | null
          created_at?: string | null
          created_by?: string | null
          equipment?: string | null
          hotspots?: Json | null
          id?: string
          image_type?: string
          job_id?: string | null
          location?: string | null
          max_temperature?: number | null
          min_temperature?: number | null
          normal_image?: string | null
          notes?: string | null
          site_id?: string | null
          status?: string | null
          updated_at?: string | null
          uploaded_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thermal_imaging_reports_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thermal_imaging_reports_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "business_sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      _tables_info: {
        Row: {
          column_count: number | null
          schema_name: unknown | null
          table_description: string | null
          table_name: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_debug_contractor_info: {
        Args: { user_id_param: string }
        Returns: Json
      }
      insert_contractor_license: {
        Args: {
          p_contractor_id: string
          p_license_type: string
          p_license_number: string
          p_issue_date: string
          p_expiry_date: string
          p_status?: string
          p_notes?: string
          p_provider?: string
        }
        Returns: string
      }
      register_employee_from_invitation: {
        Args: { invitation_token: string; new_user_id: string }
        Returns: boolean
      }
      update_job_status: {
        Args: { job_id: string; new_status: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
