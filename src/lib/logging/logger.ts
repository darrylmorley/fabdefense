import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const baseOptions = {
  level: isDev ? "debug" : "info",
  base: {
    service: "fabdefense",
    env: process.env.NODE_ENV,
  },
};

export const logger = isDev
  ? pino(
      baseOptions,
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("pino-pretty")({ colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" }),
    )
  : pino({
      ...baseOptions,
      formatters: { level: (label) => ({ level: label }) },
      timestamp: pino.stdTimeFunctions.isoTime,
    });

// Extract structured fields from error objects for Loki structured metadata
function extractErrorFields(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const fields: Record<string, unknown> = {
      error_type: error.name,
      error_message: error.message,
      stack: error.stack,
    };

    // Extract error code (Prisma errors, system errors, etc.)
    if (
      "code" in error &&
      typeof (error as Record<string, unknown>).code === "string"
    ) {
      fields.error_code = (error as Record<string, unknown>).code;
    }

    return fields;
  }

  if (error !== undefined && error !== null) {
    return { error_message: String(error) };
  }

  return {};
}

export const logError = (
  message: string,
  error: unknown,
  context?: Record<string, unknown>,
) => {
  logger.error({ ...extractErrorFields(error), ...context }, message);
};

export const logInfo = (
  message: string,
  context?: Record<string, unknown>,
) => {
  logger.info(context ?? {}, message);
};

export const logWarn = (
  message: string,
  context?: Record<string, unknown>,
) => {
  logger.warn(context ?? {}, message);
};

export const logDebug = (
  message: string,
  context?: Record<string, unknown>,
) => {
  logger.debug(context ?? {}, message);
};
