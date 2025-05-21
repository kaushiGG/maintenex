
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Define your tables schema here if needed
    }
    Views: {
      // Define your views schema here if needed
    }
    Functions: {
      // Define your functions schema here if needed
    }
    Enums: {
      // Define your enums schema here if needed
    }
    CompositeTypes: {
      // Define your composite types schema here if needed
    }
  }
}
