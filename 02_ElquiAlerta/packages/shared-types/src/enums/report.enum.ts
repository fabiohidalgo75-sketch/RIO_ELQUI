export enum ReportType {
  // Vecino
  OVERFLOW = 'OVERFLOW', // desborde del río
  ACTIVE_RAVINE = 'ACTIVE_RAVINE', // quebrada activa / bajada de barro
  FLOODED_HOME = 'FLOODED_HOME', // vivienda anegada
  ISOLATED_PERSON = 'ISOLATED_PERSON', // persona aislada
  ROAD_CUT = 'ROAD_CUT', // camino o Ruta 41-CH cortada
  // Vecino o brigadista
  DAMAGED_DEFENSE = 'DAMAGED_DEFENSE', // gavión / enrocado dañado
  RIVERBED_DUMP = 'RIVERBED_DUMP', // microbasural en el cauce
  MISSING_SIGNAGE = 'MISSING_SIGNAGE', // falta señalética de evacuación
  TECHNICAL_BUG = 'TECHNICAL_BUG',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  VERIFYING = 'VERIFYING',
  ATTENDED = 'ATTENDED',
  ESCALATED = 'ESCALATED',
  DISMISSED = 'DISMISSED',
}

export enum ReportPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}
