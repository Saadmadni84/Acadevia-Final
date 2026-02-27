export interface State { id: string; name: string; code: string; }
export interface City { id: string; name: string; stateId: string; }
export interface School { id: string; name: string; cityId: string; code: string; address?: string; }
