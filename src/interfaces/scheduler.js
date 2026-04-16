export function startScheduler({ intervalMinutes, onTick, logger }) {
  const intervalMs = intervalMinutes * 60 * 1000;

  logger.info('Scheduler iniciado', { intervalMinutes });

  onTick().catch((error) => {
    logger.error('Falha na execução inicial', { error: error.message });
  });

  return setInterval(() => {
    onTick().catch((error) => {
      logger.error('Falha no ciclo agendado', { error: error.message });
    });
  }, intervalMs);
}
