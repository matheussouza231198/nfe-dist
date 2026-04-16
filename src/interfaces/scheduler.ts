import type { Logger } from '../infrastructure/logging/logger.js';

interface StartSchedulerParams {
  intervalMinutes: number;
  onTick: () => Promise<void>;
  logger: Logger;
}

export function startScheduler({ intervalMinutes, onTick, logger }: StartSchedulerParams): NodeJS.Timeout {
  const intervalMs = intervalMinutes * 60 * 1000;

  logger.info('Scheduler iniciado', { intervalMinutes });

  onTick().catch((error: Error) => {
    logger.error('Falha na execução inicial', { error: error.message });
  });

  return setInterval(() => {
    onTick().catch((error: Error) => {
      logger.error('Falha no ciclo agendado', { error: error.message });
    });
  }, intervalMs);
}
