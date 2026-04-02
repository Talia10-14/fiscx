import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SENSITIVE_KEYS = new Set(['pin', 'pin_hash', 'pinHash', 'token', 'password']);

function sanitize(value) {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitize);
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(k)) continue;
    out[k] = sanitize(v);
  }
  return out;
}

export default class AuditService {
  static async log(
    {
      user_id,
      action,
      entity_id = null,
      ip_address = null,
      device_uuid = null,
      old_value = null,
      new_value = null,
    },
    db = prisma
  ) {
    return db.auditLog.create({
      data: {
        userID: user_id,
        action,
        entityID: entity_id,
        resource: 'Transaction',
        resourceID: entity_id,
        ipAddress: ip_address,
        deviceUUID: device_uuid,
        oldValue: sanitize(old_value),
        newValue: sanitize(new_value),
        details: JSON.stringify({
          old_value: sanitize(old_value),
          new_value: sanitize(new_value),
        }),
      },
    });
  }
}
