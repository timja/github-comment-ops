import winston from "winston";

import { format } from "logform";

const container = new winston.Container();

export function getLogger(name) {
  const print = format.printf(
    ({ level, message, label, timestamp, stack, ...meta }) => {
      let response = `${timestamp} [${label}] ${level}: ${message}`;
      if (meta?.user) {
        response = `${timestamp} [${label}] ${level}: [${meta?.user}] [${meta?.id}] ${message}`;
      }

      if (stack) {
        response = response += ` - ${stack}`;
      }
      return response;
    },
  );
  const useJson = process.env.JSON_PRINT === "true";
  const fmt = useJson ? format.json() : print;
  const level = (process.env.LOG_LEVEL || "INFO").toLowerCase();

  const formats = [
    format.errors({ stack: true }),
    format.label({ label: name }),
    format.timestamp(),
    fmt,
  ];
  if (!useJson) {
    formats.unshift(format.colorize());
  }
  return container.add(name, {
    format: format.combine(...formats),
    transports: [new winston.transports.Console({ level })],
  });
}
