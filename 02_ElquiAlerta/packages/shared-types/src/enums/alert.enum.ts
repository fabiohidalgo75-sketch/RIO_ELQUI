/** Niveles con los nombres de SENAPRED para que el vecino los reconozca. */
export enum AlertLevel {
  NORMAL = 'NORMAL',
  PREVENTIVA = 'PREVENTIVA', // Alerta Temprana Preventiva
  AMARILLA = 'AMARILLA',
  ROJA = 'ROJA',
}

export enum AlertTrigger {
  AUTO = 'AUTO', // worker hydro-threshold
  OPERATOR = 'OPERATOR', // decisión manual del centro de monitoreo
}

export enum DeliveryChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
}

/** Confirmación de doble vía (mejora respecto a EcoPoint). */
export enum AckStatus {
  PENDING = 'PENDING',
  SAFE = 'SAFE', // "Estoy a salvo"
  NEEDS_HELP = 'NEEDS_HELP', // "Necesito ayuda"
  NO_RESPONSE = 'NO_RESPONSE', // venció ACK_TIMEOUT_MINUTES
}

/** Períodos de retorno modelados en HEC-RAS 2D. */
export const RETURN_PERIODS = [2, 10, 50, 100] as const;
export type ReturnPeriod = (typeof RETURN_PERIODS)[number];

export const ALERT_SCENARIO: Record<AlertLevel, ReturnPeriod | null> = {
  [AlertLevel.NORMAL]: null,
  [AlertLevel.PREVENTIVA]: 10,
  [AlertLevel.AMARILLA]: 50,
  [AlertLevel.ROJA]: 100,
};
